import { z } from 'zod';

export const createProductSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(5000),
  images: z.array(z.string()).min(1).max(10),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/), // ObjectId
  basePrice: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  image: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        qty: z.number().int().positive().max(500),
      })
    )
    .min(1),
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\+?54\s?9?\s?\d{2}\s?\d{4}[-\s]?\d{4}$/), // AR phone
    email: z.string().email(),
  }),
  shipping: z.object({
    address: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    zip: z.string().regex(/^\d{4}$/), // AR postal code 4 digits
    zone: z.string().min(1),
  }),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled']),
});

export const settingsSchema = z.object({
  whatsappNumber: z.string().min(10).max(20),
  shippingZones: z.array(
    z.object({
      name: z.string().min(1).max(50),
      cost: z.number().nonnegative(),
      freeFrom: z.number().nonnegative(),
    })
  ),
  volumeDiscounts: z.array(
    z.object({
      minQty: z.number().int().positive(),
      pct: z.number().min(0).max(100),
    })
  ),
  businessInfo: z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().min(10).max(30),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(['owner', 'editor']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;