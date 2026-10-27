# Moldecito Backend API

Express + TypeScript + MongoDB + Cloudinary

## Estructura

```
server/
├── src/
│   ├── config/         # env, db, cloudinary
│   ├── middleware/     # auth, validation, errorHandler, rateLimit
│   ├── models/         # Mongoose schemas (Product, Category, Order, Settings, User)
│   ├── routes/         # Express routers (public, admin, auth, upload)
│   ├── schemas/        # Zod validation (shared client/server)
│   ├── services/       # Business logic (orderService, authService)
│   ├── utils/          # Helpers (shortId, currency, etc.)
│   └── index.ts        # Entry point
```

## Instalación

```bash
cd server
npm install
cp .env.example .env  # Editar con tus valores
npm run dev
```

## Variables de entorno requeridas

Ver `server/.env.example`

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Listado con filtros (`?category=&search=&featured=&page=&limit=&sort=`) |
| GET | `/api/products/featured` | 6 productos destacados para home |
| GET | `/api/products/:slug` | Detalle por slug |
| GET | `/api/categories` | Categorías activas |
| POST | `/api/orders/draft` | **Crear orden → devuelve `{ orderId, whatsappUrl }`** |
| GET | `/api/orders/:shortId` | Tracking público (ej: `/api/orders/PED-8492L`) |

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → setea cookie httpOnly |
| POST | `/api/auth/logout` | Limpia cookie |
| GET | `/api/auth/me` | Usuario actual (desde cookie) |

### Admin (requieren cookie JWT + role owner/editor)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/products` | Listado admin (incluye inactivos) |
| POST | `/api/admin/products` | Crear producto |
| GET | `/api/admin/products/:id` | Detalle |
| PATCH | `/api/admin/products/:id` | Actualizar |
| DELETE | `/api/admin/products/:id` | Eliminar |
| GET | `/api/admin/categories` | Listado |
| POST | `/api/admin/categories` | Crear |
| PATCH | `/api/admin/categories/:id` | Actualizar |
| DELETE | `/api/admin/categories/:id` | Eliminar (si no tiene productos) |
| GET | `/api/admin/orders` | Listado con filtros |
| GET | `/api/admin/orders/:id` | Detalle |
| PATCH | `/api/admin/orders/:id/status` | Cambiar estado |
| GET | `/api/admin/settings` | Configuración actual |
| PUT | `/api/admin/settings` | Actualizar config (envíos, descuentos, WhatsApp, negocio) |
| GET | `/api/admin/users` | Listado usuarios (solo owner) |
| POST | `/api/admin/users` | Crear usuario (solo owner) |
| DELETE | `/api/admin/users/:id` | Eliminar usuario (solo owner) |

### Upload (Cloudinary directo desde frontend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload/signature` | Devuelve `{ timestamp, uploadPreset, folder, apiKey, cloudName }` para unsigned upload |
| DELETE | `/api/upload/:publicId` | Eliminar imagen |

## Flujo de orden → WhatsApp

1. Frontend arma carrito + datos cliente/envío
2. `POST /api/orders/draft` con `{ items, customer, shipping, notes }`
3. Backend:
   - Valida productos, stock, zona de envío
   - Calcula totales con **descuentos por volumen** (config en Settings)
   - Genera `shortId` único (`PED-XXXXXX`)
   - Guarda orden en MongoDB con `status: "pending_payment"`
   - Construye mensaje WhatsApp formateado
   - Devuelve `{ orderId: "PED-8492L", whatsappUrl: "https://wa.me/..." }`
4. Frontend: `window.open(whatsappUrl, '_blank')` + limpia carrito + toast

## Tracking público

`GET /api/orders/PED-8492L` → devuelve orden con estado, items, totales, cliente, envío, historial de estados.
Frontend puede mostrar en `/pedido/PED-8492L` sin auth.

## Descuentos por volumen

Configurables en `/api/admin/settings`:
```json
{
  "volumeDiscounts": [
    { "minQty": 20, "pct": 30 },
    { "minQty": 80, "pct": 51 }
  ]
}
```
Se aplica **por línea de producto** (si llevas 20 del mismo producto, ese producto tiene 30% off).

## Zonas de envío

```json
{
  "shippingZones": [
    { "name": "AMBA", "cost": 3500, "freeFrom": 50000 },
    { "name": "Interior", "cost": 5000, "freeFrom": 80000 }
  ]
}
```

## Cloudinary

- Crear **unsigned upload preset** llamado `moldecito_unsigned` (Settings → Upload → Add upload preset → Unsigned)
- Folder: `moldecito/products`
- Frontend sube directo a Cloudinary → recibe `public_id` → lo envía al crear producto

## Scripts

```bash
npm run dev          # tsx watch
npm run build        # tsc → dist/
npm run start        # node dist/index.js
npm run lint         # eslint
```