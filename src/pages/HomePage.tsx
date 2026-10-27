import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Award, MessageCircle } from 'lucide-react';
import type { Product, Category } from '../types';
import { fetchFeaturedProducts, fetchCategories } from '../lib/api';
import ProductCard from '../components/ProductCard';

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
    <div className="space-y-20 pb-16">
      {/* Hero Section — Full-Width Cinematic Video (Pura Vida style) */}
      <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center">
        {/* Full-bleed background video (responsive: mobile vertical / desktop horizontal) */}
        <video
          key={isMobile ? 'mobile-video' : 'desktop-video'}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/assets/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source
            src={isMobile ? '/assets/hero-video-mobile.mp4' : '/assets/hero-video.mp4'}
            type="video/mp4"
          />
          Tu navegador no soporta videos HTML5.
        </video>

        {/* Soft dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-[0.92]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white space-y-6">
          <span className="text-[11px] font-bold tracking-[0.25em] text-white/90 uppercase inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-xs">
            Herramientas de Repostería
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] max-w-3xl mx-auto drop-shadow-sm">
            Diseños pensados <br className="hidden sm:inline" />
            para tus mejores creaciones.
          </h1>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-normal leading-relaxed drop-shadow-xs">
            Cortantes y sellos con agarre trasero patentado. Diseñados para cortar con máxima precisión y sin fatiga.
          </p>

          <div className="pt-2">
            <Link
              to="/catalogo"
              className="inline-block px-10 py-4 bg-white hover:bg-rosa-50 text-gray-900 text-xs font-bold tracking-[0.16em] uppercase rounded-full transition shadow-md hover:shadow-lg active:scale-95"
            >
              Ver Catálogo
            </Link>
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
