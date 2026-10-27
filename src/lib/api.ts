import type {
  Product,
  Category,
  SiteSettings,
  Order,
  CheckoutFormData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Cloudinary image helper with fallback to local assets
export function getProductImageUrl(
  imagePathOrPublicId?: string,
  cloudName = 'moldecito',
  width = 800,
  height = 800
): string {
  if (!imagePathOrPublicId) {
    return '/assets/logo-moldecito.webp';
  }
  if (
    imagePathOrPublicId.startsWith('http://') ||
    imagePathOrPublicId.startsWith('https://') ||
    imagePathOrPublicId.startsWith('/')
  ) {
    return imagePathOrPublicId;
  }
  // Cloudinary public ID
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${imagePathOrPublicId}`;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: '5491131549457',
  shippingZones: [
    { name: 'AMBA (CABA y GBA)', cost: 3500, freeFrom: 50000 },
    { name: 'Interior de Bs. As. y provincias centrales', cost: 5000, freeFrom: 80000 },
    { name: 'Resto del país (Patagonia / Norte)', cost: 7000, freeFrom: 100000 },
  ],
  volumeDiscounts: [
    { minQty: 20, pct: 30 },
    { minQty: 80, pct: 51 },
  ],
  businessInfo: {
    name: 'Moldecito',
    address: 'Lomas de Zamora, Buenos Aires, Argentina',
    email: 'contacto@moldecito.com.ar',
    phone: '+54 9 11 3154-9457',
  },
};

// Fallback initial products if API / DB not yet seeded
export const MOCK_CATEGORIES: Category[] = [
  { _id: 'cat-1', name: 'Cortantes con Agarre', slug: 'cortantes', order: 1, active: true },
  { _id: 'cat-2', name: 'Sellos y Marcadores', slug: 'sellos', order: 2, active: true },
  { _id: 'cat-3', name: 'Packs Mayoristas', slug: 'packs', order: 3, active: true },
  { _id: 'cat-4', name: 'Herramientas Repostería', slug: 'herramientas', order: 4, active: true },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    _id: '64f1a2b3c4d5e6f7a8b90001',
    slug: 'cortante-flor-margarita-con-agarre',
    name: 'Cortante Flor Margarita c/ Agarre Trasero Patentado',
    description:
      'Cortante ergonómico con agarre trasero patentado exclusivo de Moldecito. Diseñado para repostería intensiva, galletitas decoradas y pasta de azúcar sin fatiga en la mano ni deformación de la masa.',
    images: ['/assets/diseño3.jpeg'],
    category: { _id: 'cat-1', name: 'Cortantes con Agarre', slug: 'cortantes' },
    basePrice: 2200,
    stock: 150,
    active: true,
    featured: true,
    tags: ['cortante', 'flor', 'agarre', 'repostería'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b90002',
    slug: 'sello-marcador-corazon-geometrico',
    name: 'Sello Marcador Corazón Geométrico 7cm',
    description:
      'Sello de alta definición para marcar cookies y masas. Terminación nítida y relieve perfecto que no se pega.',
    images: ['/assets/slide2_pc.jpg'],
    category: { _id: 'cat-2', name: 'Sellos y Marcadores', slug: 'sellos' },
    basePrice: 1900,
    stock: 90,
    active: true,
    featured: true,
    tags: ['sello', 'corazón', 'san-valentin', 'cookies'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b90003',
    slug: 'pack-mayorista-emprendedor-infantil',
    name: 'Pack 12 Cortantes Temática Infantil + Agarre',
    description:
      'Set completo para pasteleras y emprendedoras: animales de la selva, dinosaurios y figuras clásicas con nuestro agarre patentado.',
    images: ['/assets/diseño3.jpeg'],
    category: { _id: 'cat-3', name: 'Packs Mayoristas', slug: 'packs' },
    basePrice: 18500,
    stock: 45,
    active: true,
    featured: true,
    tags: ['pack', 'infantil', 'mayorista', 'combo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b90004',
    slug: 'cortante-letras-abecedario-completo',
    name: 'Cortante y Marcador Abecedario Tipografía Moderna',
    description:
      'Alfabeto completo de mayúsculas + números para personalización de tortas, cupcakes y cookies temáticas.',
    images: ['/assets/slide2_pc.jpg'],
    category: { _id: 'cat-1', name: 'Cortantes con Agarre', slug: 'cortantes' },
    basePrice: 3400,
    stock: 80,
    active: true,
    featured: true,
    tags: ['letras', 'abecedario', 'personalizado'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b90005',
    slug: 'alisador-guias-niveladoras-fondant',
    name: 'Set de Guías Niveladoras de Espesor para Masas (3mm y 5mm)',
    description:
      'Varillas niveladoras resistentes y de grado alimenticio para estirar masas con grosor 100% parejo en toda la superficie.',
    images: ['/assets/diseño3.jpeg'],
    category: { _id: 'cat-4', name: 'Herramientas Repostería', slug: 'herramientas' },
    basePrice: 2800,
    stock: 120,
    active: true,
    featured: true,
    tags: ['herramientas', 'guias', 'fondant', 'nivelador'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b90006',
    slug: 'cortante-estrella-fugaz-navidad',
    name: 'Cortante Estrella Fugaz con Agarre Ergonómico',
    description:
      'Corte limpio de bordes filosos reforzados. Fabricado con PLA ecológico de alta durabilidad y agarre ergonómico posterior.',
    images: ['/assets/slide2_pc.jpg'],
    category: { _id: 'cat-1', name: 'Cortantes con Agarre', slug: 'cortantes' },
    basePrice: 2100,
    stock: 200,
    active: true,
    featured: true,
    tags: ['navidad', 'estrella', 'cookies'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<{ data: Product[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
  try {
    const url = new URL(`${API_URL}/products`);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.featured !== undefined) url.searchParams.set('featured', String(params.featured));
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    if (params?.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('API error fetching products, using mock fallback:', err);
    let filtered = [...MOCK_PRODUCTS];
    if (params?.featured) {
      filtered = filtered.filter((p) => p.featured);
    }
    if (params?.category) {
      filtered = filtered.filter(
        (p) =>
          (typeof p.category === 'object' && p.category.slug === params.category) ||
          p.category === params.category
      );
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return {
      data: filtered,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: filtered.length,
        pages: 1,
      },
    };
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products/featured`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API error fetching featured products, using mock fallback:', err);
    return MOCK_PRODUCTS.filter((p) => p.featured);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`API error fetching product ${slug}, using mock fallback:`, err);
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API error fetching categories, using mock fallback:', err);
    return MOCK_CATEGORIES;
  }
}

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API error fetching settings, using default settings fallback:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function createOrderDraft(data: {
  items: { productId: string; qty: number }[];
  customer: CheckoutFormData['customer'];
  shipping: CheckoutFormData['shipping'];
  notes?: string;
}): Promise<{ orderId: string; whatsappUrl: string; message: string }> {
  try {
    const res = await fetch(`${API_URL}/orders/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Error al procesar el pedido (${res.status})`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('API createOrderDraft error:', err);
    // If backend is unreachable, fallback to direct client-side WhatsApp generation so checkout never breaks!
    const shortId = `PED-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    const text = encodeURIComponent(
      `Hola Moldecito! Quiero encargar el pedido #${shortId}.\n` +
      `Cliente: ${data.customer.name} (${data.customer.phone})\n` +
      `Envío a: ${data.shipping.address}, ${data.shipping.city} (${data.shipping.zone})\n` +
      (data.notes ? `Notas: ${data.notes}\n` : '') +
      `Aguardando confirmación de totales y CBU para pago.`
    );
    const whatsappUrl = `https://wa.me/5491131549457?text=${text}`;
    return {
      orderId: shortId,
      whatsappUrl,
      message: 'Pedido preparado. Conectando con WhatsApp...',
    };
  }
}

export async function fetchOrderTracking(shortId: string): Promise<Order | null> {
  try {
    const res = await fetch(`${API_URL}/orders/${encodeURIComponent(shortId.toUpperCase())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`API error tracking ${shortId}:`, err);
    return null;
  }
}

