# 🧁 Moldecito Commerce — E-Commerce & Catálogo Mayorista

Plataforma de comercio electrónico de diseño editorial y minimalista desarrollada para **Moldecito**, marca argentina líder en diseño y fabricación 3D de cortantes, sellos y herramientas de repostería con agarre trasero patentado.

> **Stack moderno:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Express · MongoDB · Cloudinary · Zod

---

## 🌟 Características Principales

- **Diseño Editorial & Minimalista:** Interfaz estética inspirada en marcas lifestyle internacionales (como Pura Vida Bracelets), con navegación limpia, banner animado y Hero cinematográfico responsivo con video optimizado (versión horizontal 16:9 en desktop y vertical 9:16 en mobile).
- **Escala Mayorista en Tiempo Real:** Motor de cálculo automático de descuentos por volumen por línea de producto (20+ unidades: 30% OFF · 80+ unidades: 51% OFF).
- **Flujo de Venta Directo a WhatsApp:** Generación de pedidos estructurados con identificador único colisión-resistente (`PED-XXXXL`), calculando subtotales, zonas de envío y descuentos.
- **Seguimiento Público de Pedidos (Live Tracking):** Permite a los clientes rastrear el estado de su orden en tiempo real (`/pedido/:shortId`) a través de una línea de tiempo interactiva con 5 estados.
- **Validación Robusta de Extremo a Extremo:** Esquemas de validación unificados con **Zod** tanto en el frontend como en el backend.
- **Seguridad en Producción:** Variables de entorno desacopladas, rate limiting por IP, sanitización con Helmet y cookies JWT `httpOnly` seguras.

---

## 🏗️ Arquitectura Técnica

Estructura Monorepo organizada y escalable:

```
moldecito-commerce/
├── src/                    # Frontend SPA (React 19 + Vite 8 + Tailwind CSS v4)
│   ├── components/         # Navbar responsivo, CartDrawer, Footer con ola SVG, etc.
│   ├── context/            # CartContext con persistencia en localStorage
│   ├── lib/                # API client tipado, helpers de Cloudinary y ordenes
│   ├── pages/              # Home, Catálogo con filtros URL, Detalle, Bolsa, Checkout, Tracking
│   └── types/              # Definiciones TypeScript compartidas
├── server/                 # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/         # Conexión MongoDB, Cloudinary y variables de entorno tipadas
│   │   ├── middleware/     # Auth JWT, validación Zod, rate limit, error handler central
│   │   ├── models/         # Esquemas Mongoose (Product, Category, Order, Settings, User)
│   │   ├── routes/         # Endpoints públicos (/api/*) y protegidos (/api/admin/*)
│   │   └── services/       # Lógica pura de cálculo mayorista y formateo WhatsApp
│   └── package.json        # Dependencias y scripts del servidor
├── public/                 # Assets estáticos (videos optimizados, favicons, logos)
└── package.json            # Scripts concurrentes raíz (dev:all, build:all)
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js >= 20
- MongoDB (local o cluster gratuito en MongoDB Atlas)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/moldecito-commerce.git
cd moldecito-commerce
```

### 2. Instalar dependencias
```bash
# Dependencias del frontend
npm install

# Dependencias del backend
npm install --prefix server
```

### 3. Configurar variables de entorno
Crea tu archivo de variables locales para el backend a partir del ejemplo:
```bash
cd server
cp .env.example .env
```
Edita `server/.env` con tus credenciales seguras (MongoDB, JWT Secret, Cloudinary).

### 4. Iniciar en modo desarrollo
Desde la raíz del proyecto:
```bash
npm run dev:all        # Inicia simultáneamente Frontend (puerto 8443) y Backend (puerto 3001)
```

O por separado:
```bash
npm run dev            # Solo Frontend (Vite)
npm run dev:server     # Solo Backend (tsx watch)
```

---

## 🛡️ Seguridad & Mejores Prácticas
- Ninguna credencial ni clave de API se encuentra expuesta en el código fuente.
- Los archivos `.env` y carpetas de dependencias (`node_modules/`, `dist/`) se encuentran estrictamente ignorados por Git.
- Validaciones tipadas en cada payload de entrada para prevenir inyecciones y datos corruptos.

---

## 📄 Licencia
Este proyecto fue desarrollado como solución e-commerce a medida.
Todos los derechos sobre la marca, diseños y modelos 3D pertenecen a **Moldecito**.
