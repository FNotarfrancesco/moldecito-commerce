import type { CartItem, ShippingZone, VolumeDiscountTier, CartTotals } from '../types';
import { DEFAULT_SETTINGS } from './api';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateVolumeDiscount(
  qty: number,
  tiers: VolumeDiscountTier[] = DEFAULT_SETTINGS.volumeDiscounts
): number {
  const applicable = tiers.filter((t) => qty >= t.minQty).sort((a, b) => b.pct - a.pct);
  return applicable[0]?.pct ?? 0;
}

export function getNextDiscountTier(
  qty: number,
  tiers: VolumeDiscountTier[] = DEFAULT_SETTINGS.volumeDiscounts
): { needed: number; pct: number; targetQty: number } | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (const tier of sorted) {
    if (qty < tier.minQty) {
      return {
        needed: tier.minQty - qty,
        pct: tier.pct,
        targetQty: tier.minQty,
      };
    }
  }
  return null;
}

export function calculateCartTotals(
  items: CartItem[],
  zone?: ShippingZone,
  tiers: VolumeDiscountTier[] = DEFAULT_SETTINGS.volumeDiscounts
): CartTotals {
  let subtotal = 0;
  let totalDiscount = 0;

  const breakdown = items.map((item) => {
    const discountPct = calculateVolumeDiscount(item.qty, tiers);
    const lineSubtotal = item.unitPrice * item.qty;
    const lineDiscount = Math.round(lineSubtotal * (discountPct / 100));
    const lineTotal = lineSubtotal - lineDiscount;

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;

    return {
      productId: item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice,
      discountPct,
      lineTotal,
    };
  });

  const netSubtotal = subtotal - totalDiscount;
  let shippingCost = 0;

  if (zone) {
    shippingCost = netSubtotal >= zone.freeFrom ? 0 : zone.cost;
  }

  const total = netSubtotal + shippingCost;

  return {
    subtotal,
    discount: totalDiscount,
    shipping: shippingCost,
    total,
    zone,
    breakdown,
  };
}

