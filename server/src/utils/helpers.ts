export function generateShortId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PED-${timestamp}${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('54')) return cleaned;
  if (cleaned.startsWith('0')) return `54${cleaned.slice(1)}`;
  return `54${cleaned}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateVolumeDiscount(qty: number, tiers: Array<{ minQty: number; pct: number }>): number {
  const applicable = tiers.filter((t) => qty >= t.minQty).sort((a, b) => b.pct - a.pct);
  return applicable[0]?.pct ?? 0;
}