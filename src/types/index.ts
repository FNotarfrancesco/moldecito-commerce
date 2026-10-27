export interface Product {
  _id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  category: string | { _id: string; name: string; slug: string };
  basePrice: number;
  stock?: number;
  active: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface ShippingZone {
  name: string;
  cost: number;
  freeFrom: number;
}

export interface VolumeDiscountTier {
  minQty: number;
  pct: number;
}

export interface BusinessInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  shippingZones: ShippingZone[];
  volumeDiscounts: VolumeDiscountTier[];
  businessInfo: BusinessInfo;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  qty: number;
  unitPrice: number;
  image: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  zone?: ShippingZone;
  breakdown: {
    productId: string;
    qty: number;
    unitPrice: number;
    discountPct: number;
    lineTotal: number;
  }[];
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  shortId: string;
  items: OrderItem[];
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
  notes?: string;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    at: string;
    by: 'customer' | 'admin' | 'system';
  }[];
  whatsappSentAt?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
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
  };
  notes?: string;
}

