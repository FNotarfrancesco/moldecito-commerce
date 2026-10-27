import { Schema, model, models } from 'mongoose';
import type { IOrder, IOrderItem } from './interfaces.js';

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discountPct: { type: Number, required: true, min: 0, max: 100, default: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: ['pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled'], required: true },
    at: { type: Date, default: Date.now },
    by: { type: String, enum: ['customer', 'admin', 'system'], required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    shortId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    items: { type: [orderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
    },
    shipping: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      zone: { type: String, required: true, trim: true },
      cost: { type: Number, required: true, min: 0 },
    },
    notes: { type: String, default: '', trim: true },
    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0, default: 0 },
      shipping: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled'],
      default: 'pending_payment',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    whatsappSentAt: { type: Date, required: true },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ shortId: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ createdAt: -1 });

// Middleware para actualizar timestamps de estado
orderSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    const now = new Date();
    switch (this.status) {
      case 'paid':
        this.paidAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
    }
    this.statusHistory.push({ status: this.status, at: now, by: 'admin' });
  }
  next();
});

export const Order = models.Order ?? model<IOrder>('Order', orderSchema);