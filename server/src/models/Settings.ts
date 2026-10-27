import { Schema, model, models } from 'mongoose';
import type { ISettings } from './interfaces.js';

const settingsSchema = new Schema<ISettings>(
  {
    singleton: { type: String, enum: ['settings'], required: true, unique: true, default: 'settings' },
    whatsappNumber: { type: String, required: true, trim: true, default: '5491131549457' },
    shippingZones: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          cost: { type: Number, required: true, min: 0 },
          freeFrom: { type: Number, required: true, min: 0 },
        },
      ],
      default: [
        { name: 'AMBA', cost: 3500, freeFrom: 50000 },
        { name: 'Interior', cost: 5000, freeFrom: 80000 },
        { name: 'Resto del país', cost: 7000, freeFrom: 100000 },
      ],
    },
    volumeDiscounts: {
      type: [
        {
          minQty: { type: Number, required: true, min: 1 },
          pct: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
      default: [
        { minQty: 20, pct: 30 },
        { minQty: 80, pct: 51 },
      ],
    },
    businessInfo: {
      name: { type: String, required: true, trim: true, default: 'Moldecito' },
      address: { type: String, required: true, trim: true, default: 'Lomas de Zamora, Bs.As.' },
      email: { type: String, required: true, trim: true, lowercase: true, default: 'hola@moldecito.com' },
      phone: { type: String, required: true, trim: true, default: '+54 9 11 3154-9457' },
    },
  },
  { timestamps: true }
);

export const Settings = models.Settings ?? model<ISettings>('Settings', settingsSchema);

export async function getSettings(): Promise<ISettings> {
  let settings = await Settings.findOne({ singleton: 'settings' }).lean<ISettings>();
  if (!settings) {
    settings = await Settings.create({ singleton: 'settings' });
  }
  return settings as ISettings;
}