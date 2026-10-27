import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
  slug: string;
  name: string;
  description: string;
  images: string[]; // Cloudinary public_ids
  category: Types.ObjectId;
  basePrice: number; // en ARS, precio unitario sin descuento
  stock?: number;
  active: boolean;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string; // Cloudinary public_id
  order: number;
  active: boolean;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string; // snapshot al momento de la orden
  qty: number;
  unitPrice: number; // precio base
  discountPct: number; // 0, 30, 51
  lineTotal: number; // qty * unitPrice * (1 - discountPct/100)
}

export interface IOrder extends Document {
  shortId: string; // "PED-8492L"
  items: IOrderItem[];
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  shipping: {
    address: string;
    city: string;
    zip: string;
    zone: string;
    cost: number;
  };
  notes: string;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  status: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: IOrder['status'];
    at: Date;
    by: 'customer' | 'admin' | 'system';
  }>;
  whatsappSentAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettings extends Document {
  singleton: 'settings';
  whatsappNumber: string;
  shippingZones: Array<{
    name: string;
    cost: number;
    freeFrom: number;
  }>;
  volumeDiscounts: Array<{
    minQty: number;
    pct: number;
  }>;
  businessInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  updatedAt: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'owner' | 'editor';
  active: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}