import { getSettings } from '../models/Settings.js';
import type { IOrderItem } from '../models/interfaces.js';
import { calculateVolumeDiscount, formatCurrency, formatPhoneForWhatsApp } from '../utils/helpers.js';

export interface DiscountBreakdown {
  itemId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface TotalsCalculation {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  breakdown: DiscountBreakdown[];
}

export function calculateTotals(
  items: Array<{ productId: string; name: string; qty: number; unitPrice: number }>,
  shippingZone: { cost: number; freeFrom: number },
  volumeDiscountTiers: Array<{ minQty: number; pct: number }>
): TotalsCalculation {
  const breakdown: DiscountBreakdown[] = [];

  let subtotal = 0;
  let totalDiscount = 0;

  for (const item of items) {
    const discountPct = calculateVolumeDiscount(item.qty, volumeDiscountTiers);
    const lineSubtotal = item.unitPrice * item.qty;
    const lineDiscount = Math.round(lineSubtotal * (discountPct / 100));
    const lineTotal = lineSubtotal - lineDiscount;

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;

    breakdown.push({
      itemId: item.productId,
      productName: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      discountPct,
      lineSubtotal,
      lineDiscount,
      lineTotal,
    });
  }

  const shipping = subtotal - totalDiscount >= shippingZone.freeFrom ? 0 : shippingZone.cost;
  const total = subtotal - totalDiscount + shipping;

  return { subtotal, discount: totalDiscount, shipping, total, breakdown };
}

export function buildWhatsAppMessage(
  orderId: string,
  items: IOrderItem[],
  totals: TotalsCalculation,
  customer: { name: string; phone: string; email: string },
  shipping: { address: string; city: string; zip: string; zone: string },
  notes: string
): string {
  const lines = [
    `Hola! Quiero encargar el pedido #${orderId}.`,
    '',
    '📦 *Productos:*',
  ];

  for (const item of items) {
    const discountText = item.discountPct > 0 ? ` (desc. ${item.discountPct}%)` : '';
    lines.push(`- ${item.name} ×${item.qty} @ ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}${discountText}`);
  }

  lines.push(
    '',
    `💰 *Subtotal:* ${formatCurrency(totals.subtotal)}`,
    `🎁 *Descuento vol.:* -${formatCurrency(totals.discount)}`,
    `🚚 *Envío:* ${formatCurrency(totals.shipping)}`,
    `✅ *TOTAL: ${formatCurrency(totals.total)}*`,
    '',
    `👤 *Cliente:* ${customer.name}`,
    `📱 *Tel:* ${formatPhoneForWhatsApp(customer.phone)}`,
    `📧 *Email:* ${customer.email}`,
    '',
    `📍 *Envío a:* ${shipping.address}, ${shipping.city} (CP ${shipping.zip})`,
    `🗺️ *Zona:* ${shipping.zone}`,
  );

  if (notes.trim()) {
    lines.push('', `📝 *Notas:* ${notes}`);
  }

  lines.push('', '— Moldecito 🍪');

  return lines.join('\n');
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}