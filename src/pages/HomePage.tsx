import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Award, MessageCircle } from 'lucide-react';
import type { Product, Category } from '../types';
import { fetchFeaturedProducts, fetchCategories } from '../lib/api';
import ProductCard from '../components/ProductCard';

/* Crisp infinite-resolution SVG clouds matching the illustration's flat/stepped vector style */
function CloudSteppedA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M4 33 A13 12 0 0 1 20 22 A16 15 0 0 1 47 19 A25 24 0 0 1 90 14 A19 16 0 0 1 121 16 A11 10 0 0 1 139 19 A11 8 0 0 1 155 23 L95 23 A12 12 0 0 1 102 33 Z"
        fill="#FDE6EE"
      />
    </svg>
  );
}

function CloudFlatB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 34" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M5 31 A13 10 0 0 1 24 24 A13 11 0 0 1 43 19 A19 16 0 0 1 76 17 A11 9 0 0 1 88 16 A24 23 0 0 1 131 16 A16 17 0 0 1 155 31 Z"
        fill="#FDE6EE"
      />
    </svg>
  );
}

function CloudSteppedC({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M4 29 A18 11 0 0 1 29 20 A12 10 0 0 1 43 14 A23 20 0 0 1 84 11 A12 10 0 0 1 100 13 A13 11 0 0 1 119 17 A11 8 0 0 1 135 21 L81 21 A10 10 0 0 1 87 29 Z"
        fill="#FDE6EE"
      />
    </svg>
  );
}

function CloudOrganicD({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M6 38 A15 12 0 0 1 27 27 A18 16 0 0 1 56 17 A30 27 0 0 1 112 14 A20 17 0 0 1 144 21 A15 12 0 0 1 168 26 A14 10 0 0 1 184 38 Z"
        fill="#FDE6EE"
      />
    </svg>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    Promise.all([fetchFeaturedProducts(), fetchCategories()])
      .then(([feat, cats]) => {
        setFeatured(feat);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const collectionImages: Record<string, string> = {
    cortantes: '/assets/diseño3.jpeg',
    sellos: '/assets/slide2_pc.jpg',
    packs: '/assets/collection1.jpg',
    herramientas: '/assets/collection2.jpg',
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Hero Section — 3-Layer Live Illustration (Sky + Infinite Clouds + Foreground Mountains & Arch) */}
      <section className="relative w-full overflow-hidden select-none">
        {/* ================= DESKTOP HERO (1964x1094 Hi-Res Illustration) ================= */}
        <div className="hidden sm:block relative w-full aspect-[1964/1094] bg-[#352627] overflow-hidden">
          {/* Layer 1: Untouched Full-Resolution Base Illustration (100% lossless sky & shadows) */}
          <img
            src="/assets/hero_desktop_noclouds.jpg?v=3"
            alt=""
            className="absolute inset-0 z-0 w-full h-full object-fill pointer-events-none"
          />

          {/* Layer 2A: Upper & Mid Clouds — Medium Speed Loop (100% Vector SVG) */}
          <div className="absolute inset-0 z-10 pointer-events-none flex w-[200%] animate-clouds-medium">
            {[0, 1].map((half) => (
              <div key={half} className="relative w-1/2 h-full">
                <CloudSteppedA className="absolute top-[15.5%] left-[6%] w-[15.2%] h-auto" />
                <CloudFlatB className="absolute top-[11%] left-[74%] w-[15.2%] h-auto" />
                <CloudOrganicD className="absolute top-[21.5%] left-[41%] w-[17.5%] h-auto" />
                <CloudSteppedC className="absolute top-[47.2%] left-[19%] w-[13.2%] h-auto" />
              </div>
            ))}
          </div>

          {/* Layer 2B: Distant & Horizon Clouds — Slow Parallax Loop (100% Vector SVG) */}
          <div className="absolute inset-0 z-10 pointer-events-none flex w-[200%] animate-clouds-slow">
            {[0, 1].map((half) => (
              <div key={half} className="relative w-1/2 h-full">
                <CloudOrganicD className="absolute top-[17.5%] left-[84%] w-[19%] h-auto" />
                <CloudSteppedC className="absolute top-[44.8%] left-[77%] w-[12%] h-auto" />
                <CloudSteppedA className="absolute top-[49.2%] left-[64%] w-[13.5%] h-auto" />
                <CloudFlatB className="absolute top-[33%] left-[2%] w-[13.5%] h-auto" />
              </div>
            ))}
          </div>

          {/* Layer 3: Hi-Res Foreground Cutout ("MOLDECITO" Arch + Cookie Cutter Mountains) */}
          <img
            src="/assets/hero-fg-desktop.png?v=3"
            alt="Moldecito"
            className="absolute inset-0 z-20 w-full h-full object-fill pointer-events-none"
          />

          {/* Layer 4: Compact Text & CTA Button in the dark gap between the Arch and Mountains */}
          <div className="absolute inset-x-0 top-[26.5%] z-30 flex flex-col items-center text-center px-4 pointer-events-none">
            <h1 className="font-fredoka text-lg md:text-xl lg:text-[25px] xl:text-[28px] leading-[1.16] font-semibold text-[#FDE6EE] tracking-wide max-w-md drop-shadow-[0_2px_10px_rgba(40,24,28,0.95)]">
              Diseños pensados para <br />
              tus mejores creaciones.
            </h1>

            <div className="mt-2.5 lg:mt-3.5 pointer-events-auto">
              <Link
                to="/catalogo"
                className="inline-block px-7 lg:px-9 py-2.5 lg:py-3 bg-[#F49BC2] hover:bg-[#eb8ab5] text-white text-[11px] lg:text-xs font-black tracking-[0.18em] uppercase rounded-full transition shadow-[0_6px_20px_rgba(0,0,0,0.45)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] active:scale-95"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>

        {/* ================= MOBILE HERO (1340x2400 3x Retina Illustration) ================= */}
        <div className="sm:hidden relative w-full aspect-[1340/2400] bg-[#3C292D] overflow-hidden">
          {/* Layer 1: Base Illustration (100% lossless sky & shadows) */}
          <img
            src="/assets/hero_mobile_noclouds.jpg?v=3"
            alt=""
            className="absolute inset-0 z-0 w-full h-full object-fill pointer-events-none"
          />

          {/* Layer 2A: Upper & Mid Clouds — Medium Speed Loop (100% Vector SVG) */}
          <div className="absolute inset-0 z-10 pointer-events-none flex w-[200%] animate-clouds-medium">
            {[0, 1].map((half) => (
              <div key={half} className="relative w-1/2 h-full">
                <CloudFlatB className="absolute top-[6%] left-[60%] w-[27.5%] h-auto" />
                <CloudSteppedA className="absolute top-[13%] left-[6%] w-[27%] h-auto" />
                <CloudOrganicD className="absolute top-[37.5%] left-[2%] w-[31%] h-auto" />
                <CloudSteppedC className="absolute top-[48.5%] left-[14%] w-[23.5%] h-auto" />
              </div>
            ))}
          </div>

          {/* Layer 2B: Distant & Horizon Clouds — Slow Parallax Loop (100% Vector SVG) */}
          <div className="absolute inset-0 z-10 pointer-events-none flex w-[200%] animate-clouds-slow">
            {[0, 1].map((half) => (
              <div key={half} className="relative w-1/2 h-full">
                <CloudOrganicD className="absolute top-[15.2%] left-[72%] w-[32%] h-auto" />
                <CloudSteppedC className="absolute top-[25.5%] left-[38%] w-[21%] h-auto" />
                <CloudFlatB className="absolute top-[46.8%] left-[73%] w-[21%] h-auto" />
                <CloudSteppedA className="absolute top-[50.2%] left-[61%] w-[23.5%] h-auto" />
              </div>
            ))}
          </div>

          {/* Layer 3: Hi-Res Foreground Cutout ("MOLDECITO" Arch + Cookie Cutter Mountains) */}
          <img
            src="/assets/hero-fg-mobile.png?v=3"
            alt="Moldecito"
            className="absolute inset-0 z-20 w-full h-full object-fill pointer-events-none"
          />

          {/* Layer 4: Compact Text & CTA Button in the dark gap between the Arch and Mountains */}
          <div className="absolute inset-x-0 top-[34.5%] z-30 flex flex-col items-center text-center px-6 pointer-events-none">
            <h1 className="font-fredoka text-[19px] leading-[1.18] font-semibold text-[#FDE6EE] tracking-wide drop-shadow-[0_2px_10px_rgba(40,24,28,0.95)]">
              Diseños pensados para <br />
              tus mejores creaciones.
            </h1>

            <div className="mt-3 pointer-events-auto">
              <Link
                to="/catalogo"
                className="inline-block px-8 py-3 bg-[#F49BC2] hover:bg-[#eb8ab5] text-white text-xs font-black tracking-[0.18em] uppercase rounded-full transition shadow-[0_6px_20px_rgba(0,0,0,0.45)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] active:scale-95"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category / Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-1">
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">
            Colecciones
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explorá por Categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/catalogo?category=${cat.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-xs">
                <img
                  src={collectionImages[cat.slug] || '/assets/diseño3.jpeg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-gray-900 group-hover:text-rosa-600 transition">
                {cat.name}
              </h3>
              <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                Ver modelos →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase block mb-1">
              Los Favoritos
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Más Vendidos
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-xs font-bold tracking-wider uppercase text-gray-700 hover:text-black transition flex items-center gap-1.5"
          >
            <span>Ver todo</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center pt-10">
          <Link
            to="/catalogo"
            className="inline-block px-8 py-3.5 border border-gray-900 text-gray-900 hover:bg-black hover:text-white text-xs font-bold tracking-[0.16em] uppercase rounded-full transition"
          >
            Explorar Todo el Catálogo
          </Link>
        </div>
      </section>

      {/* Editorial / Brand Story Section (Pura Vida style split) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#fbf8f9] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xs">
              <img
                src="/assets/diseño3.jpeg"
                alt="Detalle Cortante Moldecito"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-rosa-600 uppercase block">
              Patente Argentina
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              El agarre ergonómico que cuida tus manos.
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Diseñado especialmente para pasteleras y emprendedoras. Nuestro agarre trasero distribuye la presión de forma uniforme en la palma de tu mano, evitando la fatiga y logrando cortes limpios y exactos en cada masa.
            </p>
            <div className="pt-2">
              <Link
                to="/catalogo?category=cortantes"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-900 hover:text-rosa-600 transition"
              >
                <span>Conocé los modelos con agarre</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-100 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="p-3 rounded-full bg-gray-50 text-gray-800">
              <Award size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Agarre Patentado</h4>
              <p className="text-xs text-gray-500 mt-0.5">Comodidad y precisión para grandes producciones</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="p-3 rounded-full bg-gray-50 text-gray-800">
              <Truck size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Envíos a Todo el País</h4>
              <p className="text-xs text-gray-500 mt-0.5">Directo a tu puerta o sucursal más cercana</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="p-3 rounded-full bg-gray-50 text-gray-800">
              <MessageCircle size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Atención por WhatsApp</h4>
              <p className="text-xs text-gray-500 mt-0.5">Asesoramiento personalizado en cada compra</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
