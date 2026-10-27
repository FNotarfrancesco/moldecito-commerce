import { Schema, model, models } from 'mongoose';
import type { ICategory } from './interfaces.js';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ active: 1, order: 1 });

export const Category = models.Category ?? model<ICategory>('Category', categorySchema);