import { Schema, model, models } from 'mongoose';
import type { IProduct } from './interfaces.js';

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    images: [{ type: String, default: [] }], // Cloudinary public_ids
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    basePrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

productSchema.index({ active: 1, featured: -1, createdAt: -1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = models.Product ?? model<IProduct>('Product', productSchema);