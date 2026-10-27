import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Minus, Check, ArrowRight } from 'lucide-react';
import type { Product } from '../types';
import { fetchProductBySlug, getProductImageUrl, fetchFeaturedProducts } from '../lib/api';
import { formatCurrency, calculateVolumeDiscount } from '../lib/orderUtils';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, settings } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setSelectedImageIdx(0);
        setQty(1);
      })
      .finally(() => setLoading(false));

    fetchFeaturedProducts().then(setRelated);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-10 bg-gray-100 rounded w-3/4" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Producto no encontrado</h2>
        <Link
          to="/catalogo"
          className="inline-block px-6 py-3 border border-gray-900 text-gray-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' ? product.category.name : 'Cortantes';
  const discountPct = calculateVolumeDiscount(qty, settings.volumeDiscounts);
  const unitDiscount = Math.round(product.basePrice * (discountPct / 100));
  const effectiveUnitPrice = product.basePrice - unitDiscount;
  const lineTotal = effectiveUnitPrice * qty;

  const images = product.images && product.images.length > 0 ? product.images : ['/assets/diseño3.jpeg'];
  const activeImageUrl = getProductImageUrl(images[selectedImageIdx]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
        <Link to="/" className="hover:text-black">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-black">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
        {/* Gallery */}
        <div className="md:col-span-7 space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={activeImageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border transition flex-shrink-0 ${
                    selectedImageIdx === idx ? 'border-black' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getProductImageUrl(img, undefined, 150, 150)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase block">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(effectiveUnitPrice)}
              </span>
              {discountPct > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.basePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Discreet wholesale note */}
          <div className="py-2.5 px-3.5 rounded-lg bg-gray-50 text-[11px] text-gray-600 border border-gray-100">
            Precios mayoristas automáticos: <strong>20+ uds: 30% OFF</strong> · <strong>80+ uds: 51% OFF</strong>
          </div>

          {/* Quantity Selector + Add Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-full bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-1.5 text-gray-600 hover:text-black transition"
                  aria-label="Menos"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-xs font-bold text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="p-1.5 text-gray-600 hover:text-black transition"
                  aria-label="Más"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addItem(product, qty)}
                className="flex-1 py-3.5 bg-[#151515] hover:bg-black text-white text-xs font-bold tracking-[0.16em] uppercase rounded-full transition shadow-xs"
              >
                Agregar al Carrito • {formatCurrency(lineTotal)}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Descripción
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Feature list */}
          <div className="pt-2 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Check size={15} className="text-gray-900" />
              <span>Agarre trasero patentado ergonómico</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={15} className="text-gray-900" />
              <span>Filo nítido de alta precisión para masa y pasta</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={15} className="text-gray-900" />
              <span>Envíos a todo el país desde Lomas de Zamora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-gray-100 space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-900">
              También te puede interesar
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
