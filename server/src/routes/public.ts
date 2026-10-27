import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order, type IOrder } from '../models/index.js';
import { getSettings } from '../models/index.js';
import { calculateTotals, buildWhatsAppMessage, getWhatsAppUrl } from '../services/orderService.js';
import { generateShortId } from '../utils/helpers.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { checkoutSchema } from '../schemas/validation.js';
import { orderDraftLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ISettings } from '../models/index.js';

const router = Router();

const shortIdParamSchema = z.object({
  shortId: z.string().regex(/^PED-[A-Z0-9]+$/),
});

// GET /api/products - Listado con filtros, paginación
router.get('/products', async (req, res) => {
  const { category, search, featured, active = 'true', page = '1', limit = '20', sort = '-createdAt' } = req.query;

  const filter: Record<string, any> = { active: active === 'true' };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (search) filter.$text = { $search: search as string };

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// GET /api/products/featured - Para home
router.get('/products/featured', async (req, res) => {
  const products = await Product.find({ active: true, featured: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(6)
    .lean();
  res.json({ data: products });
});

// GET /api/products/:slug - Detalle por slug
router.get('/products/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw new AppError(404, 'Producto no encontrado');
  res.json({ data: product });
});

// GET /api/categories - Todas las categorías activas
router.get('/categories', async (req, res) => {
  const categories = await Category.find({ active: true }).sort('order name').lean();
  res.json({ data: categories });
});

// GET /api/settings - Configuración pública (envíos, descuentos por volumen, etc.)
router.get('/settings', async (req, res) => {
  const settings = await getSettings();
  res.json({
    data: {
      whatsappNumber: settings.whatsappNumber,
      shippingZones: settings.shippingZones,
      volumeDiscounts: settings.volumeDiscounts,
      businessInfo: settings.businessInfo,
    },
  });
});

// POST /api/orders/draft - Crear borrador de orden y devolver WhatsApp URL
router.post('/orders/draft', orderDraftLimiter, validateBody(checkoutSchema), async (req, res) => {
  const { items, customer, shipping, notes = '' } = req.body;

  // Obtener productos completos para precios y validar stock
  const productIds = items.map((i: any) => i.productId);
  const products = (await Product.find({ _id: { $in: productIds }, active: true }).lean()) as unknown as Array<{ _id: { toString(): string }; name: string; basePrice: number }>;
  if (products.length !== items.length) throw new AppError(400, 'Algunos productos no existen o no están activos');

  const settings = (await getSettings()) as ISettings;
  const shippingZone = settings.shippingZones.find((z) => z.name === shipping.zone);
  if (!shippingZone) throw new AppError(400, 'Zona de envío inválida');

  // Construir items con precios reales
  const orderItems = items.map((item: any) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) throw new AppError(400, `Producto ${item.productId} no encontrado`);
    return {
      productId: product._id.toString(),
      name: product.name,
      qty: item.qty,
      unitPrice: product.basePrice,
    };
  });

  // Calcular totales con descuentos por volumen
  const totals = calculateTotals(orderItems, shippingZone, settings.volumeDiscounts);

  // Generar shortId único
  let shortId = '';
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 5) {
    shortId = generateShortId();
    const existing = await Order.findOne({ shortId }).select('_id').lean();
    exists = !!existing;
    attempts++;
  }
  if (exists) throw new AppError(500, 'No se pudo generar ID único');

  // Crear orden en BD
  const orderItemsWithDiscount = totals.breakdown.map((b) => ({
    productId: b.itemId,
    name: b.productName,
    qty: b.qty,
    unitPrice: b.unitPrice,
    discountPct: b.discountPct,
    lineTotal: b.lineTotal,
  }));

  const order = await Order.create({
    shortId,
    items: orderItemsWithDiscount,
    customer,
    shipping: { ...shipping, cost: totals.shipping },
    notes,
    totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, total: totals.total },
    status: 'pending_payment',
    statusHistory: [{ status: 'pending_payment', at: new Date(), by: 'customer' }],
    whatsappSentAt: new Date(),
  });

  // Construir mensaje WhatsApp
  const message = buildWhatsAppMessage(
    order.shortId,
    order.items,
    totals,
    order.customer,
    order.shipping,
    order.notes
  );
  const whatsappUrl = getWhatsAppUrl(settings.whatsappNumber, message);

  res.status(201).json({
    orderId: order.shortId,
    whatsappUrl,
    message: 'Pedido creado. Redirigiendo a WhatsApp...',
  });
});

// GET /api/orders/:shortId - Tracking público
router.get('/orders/:shortId', validateParams(shortIdParamSchema), async (req, res) => {
  const order = (await Order.findOne({ shortId: req.params.shortId.toUpperCase() })
    .populate('items.productId', 'name slug images')
    .lean()) as IOrder | null;

  if (!order) throw new AppError(404, 'Pedido no encontrado');

  // Formatear para frontend público
  const statusLabels: Record<string, string> = {
    pending_payment: 'Pendiente de pago',
    paid: 'Pagado',
    in_production: 'En producción',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  res.json({
    data: {
      shortId: order.shortId,
      status: order.status,
      statusLabel: statusLabels[order.status],
      statusHistory: order.statusHistory,
      items: order.items.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discountPct: item.discountPct,
        lineTotal: item.lineTotal,
        image: item.productId?.images?.[0],
      })),
      totals: order.totals,
      customer: order.customer,
      shipping: order.shipping,
      notes: order.notes,
      createdAt: order.createdAt,
    },
  });
});

export default router;