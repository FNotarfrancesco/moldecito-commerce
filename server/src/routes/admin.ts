import { Router, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Settings, getSettings } from '../models/Settings.js';
import { User, type IUserModel } from '../models/index.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  updateOrderStatusSchema,
  settingsSchema,
  createUserSchema,
} from '../schemas/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateTotals } from '../services/orderService.js';

const router = Router();
const UserModel = User as IUserModel;

// Schemas para validación de params
const objectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

// Todas las rutas admin requieren autenticación
router.use(requireAuth);

// Helper para tipar req en rutas que necesitan user
const ar = (handler: (req: AuthRequest, res: Response) => Promise<void>) => handler;

// ---- PRODUCTS ----
// GET /api/admin/products - Listado admin (con inactivos)
router.get('/products', async (req, res) => {
  const { page = '1', limit = '20', search, category, active } = req.query;
  const filter: Record<string, any> = {};
  if (search) filter.$text = { $search: search as string };
  if (category) filter.category = category;
  if (active !== undefined) filter.active = active === 'true';

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort('-createdAt').skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ data: products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

// POST /api/admin/products
router.post('/products', validateBody(createProductSchema), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

// GET /api/admin/products/:id
router.get('/products/:id', validateParams(objectIdParamSchema), async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug').lean();
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ data: product });
});

// PATCH /api/admin/products/:id
router.patch('/products/:id', validateParams(objectIdParamSchema), validateBody(updateProductSchema), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ data: product });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', validateParams(objectIdParamSchema), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ message: 'Producto eliminado' });
});

// ---- CATEGORIES ----
router.get('/categories', async (req, res) => {
  const categories = await Category.find().sort('order name').lean();
  res.json({ data: categories });
});

router.post('/categories', validateBody(createCategorySchema), async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ data: category });
});

router.patch('/categories/:id', validateParams(objectIdParamSchema), validateBody(updateCategorySchema), async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new AppError(404, 'Categoría no encontrada');
  res.json({ data: category });
});

router.delete('/categories/:id', validateParams(objectIdParamSchema), async (req, res) => {
  const count = await Product.countDocuments({ category: req.params.id });
  if (count > 0) throw new AppError(400, 'No se puede eliminar: tiene productos asociados');
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Categoría eliminada' });
});

// ---- ORDERS ----
router.get('/orders', async (req, res) => {
  const { page = '1', limit = '20', status, search } = req.query;
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { shortId: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limitNum).lean(),
    Order.countDocuments(filter),
  ]);

  res.json({ data: orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

router.get('/orders/:id', validateParams(objectIdParamSchema), async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.productId', 'name slug images').lean();
  if (!order) throw new AppError(404, 'Pedido no encontrado');
  res.json({ data: order });
});

router.patch('/orders/:id/status', validateParams(objectIdParamSchema), validateBody(updateOrderStatusSchema), async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) throw new AppError(404, 'Pedido no encontrado');
  res.json({ data: order });
});

// ---- SETTINGS ----
router.get('/settings', async (req, res) => {
  const settings = await getSettings();
  res.json({ data: settings });
});

router.put('/settings', validateBody(settingsSchema), async (req, res) => {
  const settings = await Settings.findOneAndUpdate({ singleton: 'settings' }, req.body, { new: true, runValidators: true, upsert: true });
  res.json({ data: settings });
});

// ---- USERS (solo owner) ----
router.get('/users', requireRole('owner'), ar(async (req: AuthRequest, res: Response) => {
  const users = await User.find().select('-passwordHash').sort('-createdAt').lean();
  res.json({ data: users });
}));

router.post('/users', requireRole('owner'), validateBody(createUserSchema), ar(async (req: AuthRequest, res: Response) => {
  const { password, ...rest } = req.body;
  const passwordHash = await UserModel.hashPassword(password);
  const user = await User.create({ ...rest, passwordHash });
  res.status(201).json({ data: { ...user.toObject(), passwordHash: undefined } });
}));

router.delete('/users/:id', requireRole('owner'), validateParams(objectIdParamSchema), ar(async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) throw new AppError(400, 'No puedes eliminarte a ti mismo');
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Usuario eliminado' });
}));

export default router;