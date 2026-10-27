# 📋 PLAN COMPLETO DEL PROYECTO — MOLDECITO CATÁLOGO WHATSAPP

---

## 🎯 CONTEXTO DEL NEGOCIO

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Moldecito |
| **Rubro** | Cortantes, sellos y herramientas de repostería (diseño propio, impresión 3D) |
| **Diferencial** | Agarre trasero patentado (comodidad, precisión, ideal producción grande) |
| **Ubicación** | Lomas de Zamora, Bs.As., Argentina — envíos a todo el país |
| **Experiencia** | 5+ años, 5.000+ ventas en Mercado Libre, MercadoLíder Platinum (98% positivo) |
| **Precios mayoristas** | 20+ uds = 30% off · 80+ uds = 51% off (por producto, no global) |
| **Flujo de venta** | Catálogo web → Carrito localStorage → Checkout → **WhatsApp con ID único** → Pago manual (CBU/Link) → Admin actualiza estado → Cliente trackea en `/pedido/PED-XXXXL` |

---

## 🏗️ ARQUITECTURA TÉCNICA

### Monorepo (carpeta única, dos `package.json`)
```
moldecito-commerce/
├── src/                    # Frontend: Vite + React 19 + Tailwind CSS v4 + React Router
├── server/                 # Backend: Express + TypeScript + Mongoose + Cloudinary
├── package.json            # Scripts raíz: dev:all, build:all, etc.
└── public/assets/          # Imágenes estáticas + logo-moldecito.webp
```

### Stack definitivo
| Capa | Tecnología | Decisión |
|------|------------|----------|
| **Frontend** | React 19 + Vite + Tailwind v4 | SPA (no SSR), SEO no crítico (tráfico por WhatsApp/IG) |
| **Routing** | React Router v6 | `/`, `/catalogo`, `/producto/:slug`, `/carrito`, `/checkout`, `/pedido/:shortId`, `/admin/*` |
| **Estado** | React Context + `localStorage` | Carrito persistente, hidratación al montar |
| **Backend** | Express + TypeScript | Ligero, conocido, fácil deploy |
| **DB** | MongoDB Atlas (Mongoose) | Esquemas tipados, índices, text search |
| **Auth** | JWT en cookie httpOnly + roles | `owner` / `editor`, 7 días, secure en prod |
| **Imágenes** | Cloudinary (unsigned upload) | 200-300 productos, transformaciones auto (WebP/AVIF, resize) |
| **Validación** | Zod (compartido client/server) | Single source of truth |
| **Deploy** | Vercel (frontend) + Railway/Render (API) + MongoDB Atlas + Cloudinary | Gratis/barato, escalable |

---

## 🗄️ ESQUEMA MONGODB (5 modelos)

### 1. `Product`
```typescript
{
  slug: string (unique),           // "cortante-flor-5cm"
  name: string,
  description: string,
  images: string[],                // Cloudinary public_ids
  category: ObjectId (ref Category),
  basePrice: number,               // ARS, sin descuento
  stock?: number,
  active: boolean,
  featured: boolean,               // Para home (6 items)
  tags: string[],
  createdAt, updatedAt
}
```
**Índices**: `active+featured`, `category+active`, text search (`name,description,tags`)

### 2. `Category`
```typescript
{ name, slug (unique), image?, order: number, active: boolean }
```

### 3. `Order` (el corazón del flujo)
```typescript
{
  shortId: string (unique),        // "PED-8492L" — generado: PED-${base36(timestamp)}${random}
  items: [{
    productId: ObjectId,
    name: string,                  // snapshot
    qty: number,
    unitPrice: number,
    discountPct: number,           // 0, 30, 51
    lineTotal: number              // qty * unitPrice * (1 - discountPct/100)
  }],
  customer: { name, phone, email },
  shipping: { address, city, zip, zone, cost },
  notes: string,
  totals: { subtotal, discount, shipping, total },
  status: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled',
  statusHistory: [{ status, at: Date, by: 'customer'|'admin'|'system' }],
  whatsappSentAt: Date,
  paidAt?, shippedAt?, deliveredAt?,
  createdAt, updatedAt
}
```
**Índices**: `shortId` (unique), `status+createdAt`, `customer.phone`, `createdAt`

### 4. `Settings` (singleton)
```typescript
{
  singleton: 'settings',
  whatsappNumber: "54911XXXXXXXX",
  shippingZones: [
    { name: "AMBA", cost: 3500, freeFrom: 50000 },
    { name: "Interior", cost: 5000, freeFrom: 80000 },
    { name: "Resto del país", cost: 7000, freeFrom: 100000 }
  ],
  volumeDiscounts: [
    { minQty: 20, pct: 30 },
    { minQty: 80, pct: 51 }
  ],
  businessInfo: { name, address, email, phone }
}
```

### 5. `User` (admin panel)
```typescript
{ email (unique), passwordHash, name, role: 'owner'|'editor', active, lastLoginAt }
```

---

## 🔌 BACKEND API — ENDPOINTS IMPLEMENTADOS

### Públicos (`/api`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | Listado paginado: `?category=&search=&featured=&page=&limit=&sort=` |
| GET | `/products/featured` | 6 productos para home |
| GET | `/products/:slug` | Detalle por slug |
| GET | `/categories` | Categorías activas ordenadas |
| **POST** | `/orders/draft` | **Crea orden → `{ orderId: "PED-8492L", whatsappUrl }`** |
| GET | `/orders/:shortId` | Tracking público (sin auth) |

### Auth (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/login` | Login → cookie `moldecito_auth` (httpOnly, secure, sameSite=lax, 7d) |
| POST | `/logout` | Limpia cookie |
| GET | `/me` | Usuario actual desde cookie |

### Admin (`/api/admin` — requiere cookie + role)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/products` | CRUD completo (incluye inactivos) |
| GET/POST/PATCH/DELETE | `/categories` | CRUD (borrar solo si 0 productos) |
| GET | `/orders` | Listado con filtros `?status=&search=` |
| GET | `/orders/:id` | Detalle completo |
| PATCH | `/orders/:id/status` | Cambiar estado (dispara timestamps + history) |
| GET/PUT | `/settings` | Config envíos, descuentos, WhatsApp, negocio |
| GET/POST/DELETE | `/users` | Solo `owner` |

### Upload (`/api/upload` — requiere auth)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/signature` | Devuelve `{ timestamp, uploadPreset, folder, apiKey, cloudName }` para **unsigned upload directo a Cloudinary** desde frontend |
| DELETE | `/:publicId` | Elimina imagen |

---

## ⚙️ SERVICIOS CLAVE (lógica de negocio pura, testeable)

### `orderService.ts`
- **`calculateTotals(items, shippingZone, volumeDiscountTiers)`** → `{ subtotal, discount, shipping, total, breakdown[] }`
  - Aplica descuento **por línea** según `qty` del producto (20+ = 30%, 80+ = 51%)
  - Envío gratis si `subtotal - discount >= freeFrom` de la zona
- **`buildWhatsAppMessage(orderId, items, totals, customer, shipping, notes)`** → string formateado
- **`getWhatsAppUrl(phone, message)`** → `https://wa.me/...?text=...`

### `authService.ts`
- `registerUser`, `loginUser`, `generateToken`, `verifyToken`
- `setAuthCookie` / `clearAuthCookie` (httpOnly, secure en prod)

### `helpers.ts`
- `generateShortId()` → `PED-XXXXXX` (base36 timestamp + random, collision-resistant)
- `formatCurrency(ARS)`, `formatPhoneForWhatsApp`, `slugify`

---

## 🎨 FRONTEND — PLAN DE RUTAS Y COMPONENTES

### Rutas (React Router)
| Ruta | Componente | Qué muestra |
|------|------------|-------------|
| `/` | `HomePage` | Hero + strip categorías + **6 featured** + "Ver todo el catálogo" + valores + newsletter |
| `/catalogo` | `CatalogPage` | Grid completo con **sidebar filtros** (categoría, búsqueda, orden), URL sincronizada |
| `/producto/:slug` | `ProductDetailPage` | Galería, descripción, selector qty, precio con badge descuento vol., "Agregar" |
| `/carrito` | `CartPage` / Drawer | Lista editable, resumen con **cálculo descuentos en tiempo real** |
| `/checkout` | `CheckoutPage` | Form datos cliente + envío + notas → `POST /api/orders/draft` → `window.open(whatsappUrl)` |
| `/pedido/:shortId` | `TrackingPage` | **Público, sin auth** — estado, timeline, items, totales, datos envío, notas |
| `/admin/*` | `AdminLayout` + hijos | Protegido (JWT cookie) — Dashboard, Productos, Categorías, Órdenes, Config, Usuarios |

### Estado global (Context)
```typescript
// CartContext
interface CartItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  image: string;
  discountPct?: number; // calculado en runtime
}
actions: add, remove, updateQty, clear, syncLocalStorage
```

### Componentes reutilizables clave
- `ProductCard` (imagen, nombre, precio, badge descuento, quick-add)
- `CategoryChips` / `SidebarFilters` (URL sync)
- `CartDrawer` (slide-in mobile) / `CartPage` (desktop)
- `VolumeDiscountBadge` ("20+ uds: -30% · 80+ uds: -51%")
- `CheckoutForm` (Zod validation, phone AR, CP 4 dígitos)
- `OrderStatusTimeline` (tracking público)
- `AdminTable` / `AdminForm` / `ImageUploader` (Cloudinary directo)

---

## 🎨 PALETA DE COLORES / TAILWIND THEME

En `src/index.css` → `@theme`:
```css
@theme {
  --color-rosa-50:   #fdf2f7;
  --color-rosa-100:  #fce7ee;   /* ≈ #FBE4EE */
  --color-rosa-600:  #e04d7a;   /* ≈ #F49BC2 — LOGO / ACENTO / BOTONES PRIMARIOS */
  --color-rosa-700:  #c93d67;

  --color-oscuro-600: #4d3940;  /* ≈ #30262D — TEXTO PRINCIPAL */
  --color-oscuro-900: #30262d;  /* EXACTO */

  --color-surface: #FFFFFF;      /* FONDO GENERAL */
  --color-card:    #FBE4EE;      /* CARDS, BADGES, DETALLES */

  --font-sans: 'Causten', system-ui, sans-serif;
}
```

**Uso:**
- `bg-surface` / `bg-white` → fondo general
- `bg-card` → cards, secciones alternadas
- `text-oscuro-900` → texto principal
- `bg-rosa-600 hover:bg-rosa-700 text-white` → botones primarios, links activos
- `border-rosa-200` → bordes sutiles
- `bg-rosa-100 text-rosa-700` → badges, etiquetas

---

## 🔄 FLUJO COMPLETO DE PEDIDO (WHATSAPP + TRACKING)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE arma carrito en /catalogo o /producto/:slug                     │
│    → CartContext + localStorage (persiste al recargar)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CHECKOUT (/checkout)                                                    │
│    - Form: nombre, teléfono (AR), email, dirección, ciudad, CP (4 díg),   │
│      zona (select desde Settings), notas                                   │
│    - Validación Zod (compartida con backend)                               │
│    - Submit → POST /api/orders/draft                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. BACKEND (POST /api/orders/draft)                                        │
│    - Valida productos, stock, zona                                         │
│    - Calcula totales con descuentos por volumen (por línea)                │
│    - Genera shortId único: "PED-8492L"                                     │
│    - Guarda en MongoDB: status = "pending_payment"                         │
│    - Construye mensaje WhatsApp                                            │
│    - Devuelve: { orderId: "PED-8492L", whatsappUrl }                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND                                                                 │
│    - window.open(whatsappUrl, '_blank')                                    │
│    - Limpia carrito (localStorage + Context)                               │
│    - Toast: "Pedido enviado por WhatsApp. Tu ID: PED-8492L"               │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. VENDEDOR recibe WhatsApp:                                               │
│    "Hola! Quiero encargar el pedido #PED-8492L.                           │
│     - Cortante Flor ×5 @ $1.200 = $6.000                                   │
│     - Sello Corazón ×20 @ $950 = $19.000 (desc. 30%)                       │
│     ...                                                                    │
│     ✅ TOTAL: $22.800                                                      │
│     👤 Juan Pérez | 📱 +54 9 11 1234-5678                                  │
│     📍 Calle 123, Lomas de Zamora (CP 1832)                                │
│     📝 'Entregar por la tarde'"                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. VENDEDOR entra a /admin/ordenes → busca PED-8492L                       │
│    → Cambia estado: "pending_payment" → "paid" → "in_production" ...       │
│    (dispara paidAt/shippedAt/deliveredAt + statusHistory)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. VENDEDOR responde WhatsApp:                                             │
│    "¡Pago recibido! 🎉 Tu pedido #PED-8492L está en producción.            │
│     Seguilo acá: https://moldecito.com/pedido/PED-8492L"                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. CLIENTE entra a /pedido/PED-8492L (pública, sin login)                  │
│    Ve: estado actual + timeline + items + totales + datos envío + notas    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 DESPLIEGUE Y VARIABLES DE ENTORNO

### `server/.env` (crear desde `.env.example`)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/moldecito
JWT_SECRET=super-secreto-largo-y-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_NAME=moldecito_auth
CLOUDINARY_CLOUD_NAME=tu-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef
CLOUDINARY_UPLOAD_PRESET=moldecito_unsigned
WHATSAPP_NUMBER=54911XXXXXXXX
FRONTEND_URL=https://moldecito.com
```

### Cloudinary: crear **Unsigned Upload Preset**
- Settings → Upload → Add upload preset → **Unsigned**
- Name: `moldecito_unsigned`
- Folder: `moldecito/products`
- Transformations: `w_1200,h_1200,c_limit,q_auto,f_auto`

### Deploy sugerido
| Servicio | Qué deploya | Costo |
|----------|-------------|-------|
| **Vercel** | Frontend (SPA, `build` → `dist`) | Gratis |
| **Railway / Render / Fly.io** | Backend (Node, `npm run start`) | $5-10/mes |
| **MongoDB Atlas M0** | Base de datos | Gratis (512MB) |
| **Cloudinary Free** | Imágenes (25GB, 25k transformaciones/mes) | Gratis |

---

## ✅ ESTADO ACTUAL

| Fase | Estado | Qué está hecho |
|------|--------|----------------|
| **FASE 0 — Backend** | ✅ **COMPLETA** | Estructura completa, modelos, rutas, middlewares, servicios, build OK |
| **FASE 0.5 — Auth + Orders + WhatsApp** | ✅ **COMPLETA** | JWT cookies, roles, `POST /orders/draft`, `GET /orders/:shortId`, generador ID, mensaje WA |
| **FASE 1 — Frontend público** | ✅ **COMPLETA** | Home, Catálogo con filtros y búsqueda, Detalle de Producto con escala mayorista, Carrito Drawer y Página, Checkout validado con Zod, Tracking público de pedidos (`/pedido/:shortId`), Paleta Moldecito y responsive |
| **FASE 2 — Admin Panel** | ⏳ **PRÓXIMO PASO** | Login, Dashboard, CRUD Productos/Categorías, Gestión de Órdenes y cambio de estados, Settings, Usuarios |
| **FASE 3 — Pulido + Deploy** | ⏳ **PENDIENTE** | SEO, performance, tests, CI/CD, dominio, analytics |

---

## 🚀 PRÓXIMO PASO INMEDIATO: FASE 2 (ADMIN PANEL)

Orden sugerido de implementación para el Panel de Administración:

1. **AuthContext & Rutas protegidas** (`/admin/login`, `/admin/*` con cookie JWT)
2. **AdminLayout** (sidebar con navegación: Dashboard, Productos, Categorías, Órdenes, Configuración, Usuarios)
3. **Admin Dashboard** (métricas de ventas, órdenes pendientes, accesos rápidos)
4. **CRUD Productos** (listado con búsqueda, creación/edición, toggle activo/destacado, subida de imágenes a Cloudinary)
5. **CRUD Categorías** (gestión de orden y categorías)
6. **Gestión de Órdenes** (cambio de estados: `pending_payment` → `paid` → `in_production` → `shipped` → `delivered`, buscador por shortId)
7. **Configuración de Negocio** (WhatsApp number, zonas de envío y costos, escalas de descuento por volumen)
9. **Responsive** → mobile-first, drawer menu, grid 2/3/5 cols, sticky header

---

## 📝 NOTAS IMPORTANTES PARA CONTINUAR

1. **Logo**: ya está en `public/assets/logo-moldecito.webp` — usarlo en Header + Footer
2. **Imágenes de productos**: el admin subirá a Cloudinary → guarda `public_id` en `Product.images[]`
3. **Fallback de imágenes**: `getOptimizedUrl(publicId, {w:800,h:800})` para `src` + `srcSet`
4. **Descuentos en UI**: mostrar badge "20+ uds: -30%" en `ProductCard` y `ProductDetail`
5. **WhatsApp number**: viene de `Settings.whatsappNumber` (editable en admin)
6. **Zonas de envío**: select en checkout poblado desde `Settings.shippingZones`
7. **Admin seed**: primer usuario `owner` se crea manual en MongoDB o script de seed

---

## 📁 ESTRUCTURA DEL BACKEND (ya implementada)

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts          # Variables de entorno tipadas
│   │   ├── db.ts           # Conexión MongoDB (Mongoose)
│   │   └── cloudinary.ts   # Config + helpers upload/optimización
│   ├── middleware/
│   │   ├── auth.ts         # JWT cookies httpOnly, roles (owner/editor)
│   │   ├── validation.ts   # Zod validation para body/params/query
│   │   ├── errorHandler.ts # AppError, Zod, Mongoose, 404, 500
│   │   └── rateLimit.ts    # General, auth, orderDraft, search
│   ├── models/
│   │   ├── interfaces.ts   # IProduct, ICategory, IOrder, ISettings, IUser
│   │   ├── Product.ts      # Schema + índices (text search, featured, category)
│   │   ├── Category.ts     # Schema + orden
│   │   ├── Order.ts        # Schema + shortId único, statusHistory, middleware timestamps
│   │   ├── Settings.ts     # Singleton: WhatsApp, zonas envío, descuentos vol., info negocio
│   │   ├── User.ts         # Schema + bcrypt, static hashPassword, IUserModel exportado
│   │   └── index.ts        # Barrel export + tipos
│   ├── routes/
│   │   ├── public.ts       # GET products/categories, POST orders/draft, GET orders/:shortId (tracking)
│   │   ├── admin.ts        # CRUD products/categories/orders/settings/users (protegido)
│   │   ├── auth.ts         # POST login/logout, GET me (cookie JWT)
│   │   ├── upload.ts       # POST signature (unsigned Cloudinary), DELETE image
│   │   └── index.ts        # Barrel export
│   ├── schemas/
│   │   └── validation.ts   # Zod schemas compartidos client/server
│   ├── services/
│   │   ├── authService.ts  # register, login, generateToken, verifyToken, cookies
│   │   └── orderService.ts # calculateTotals (descuentos por volumen), buildWhatsAppMessage, getWhatsAppUrl
│   ├── utils/
│   │   └── helpers.ts      # generateShortId (PED-XXXXXX), formatCurrency, formatPhone, slugify
│   └── index.ts            # Express app + middlewares + rutas + startup
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🎯 COMANDOS ÚTILES

```bash
# Desde la raíz del proyecto
npm run dev:all        # Levanta frontend (8443) + backend (3001) concurrentemente
npm run dev            # Solo frontend (Vite)
npm run dev:server     # Solo backend (tsx watch)

# En server/
npm run dev            # tsx watch src/index.ts
npm run build          # tsc → dist/
npm run start          # node dist/index.js
npm run lint           # eslint

# Variables de entorno
cd server && cp .env.example .env  # Editar con valores reales
```

---

## 📌 PRÓXIMAS DECISIONES PENDIENTES

- [ ] Confirmar paleta exacta (ya definida en este doc)
- [ ] Crear cuenta Cloudinary y upload preset `moldecito_unsigned`
- [ ] Crear cluster MongoDB Atlas M0
- [ ] Definir categorías iniciales (ej: Cortantes, Sellos, Packs, Herramientas)
- [ ] Decidir si `ProductDetail` es modal o página propia (`/producto/:slug`)
- [ ] Elegir íconos (lucide-react, heroicons, o SVG custom como ahora)
- [ ] Definir copy/textos para Hero, Valores, Newsletter, Footer

---

*Documento generado automáticamente — Última actualización: 23 Oct 2026*