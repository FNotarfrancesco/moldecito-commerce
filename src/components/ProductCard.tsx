import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { formatCurrency } from '../lib/orderUtils';
import { getProductImageUrl } from '../lib/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const categoryName = typeof product.category === 'object' ? product.category.name : 'Cortantes';
  const imageUrl = getProductImageUrl(product.images?.[0]);

  return (
    <div className="group flex flex-col justify-between">
      <div>
        {/* Clean Image Container - No noisy badges */}
        <Link
          to={`/producto/${product.slug}`}
          className="relative block aspect-square overflow-hidden rounded-xl bg-gray-50 mb-3"
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Clean Quick Add on Hover (Desktop) */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addItem(product, 1);
              }}
              className="w-full py-2.5 bg-white/95 backdrop-blur-xs text-gray-900 hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition"
            >
              Agregar al Carrito
            </button>
          </div>
        </Link>

        {/* Clean Product Info */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            {categoryName}
          </span>
          <Link
            to={`/producto/${product.slug}`}
            className="font-medium text-sm text-gray-900 hover:text-rosa-600 transition line-clamp-1 block leading-snug"
          >
            {product.name}
          </Link>
          <div className="pt-0.5">
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(product.basePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Add to Cart button */}
      <div className="sm:hidden mt-2 pt-1">
        <button
          type="button"
          onClick={() => addItem(product, 1)}
          className="w-full py-2 bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 active:bg-gray-200 transition"
        >
          <Plus size={14} />
          <span>Agregar</span>
        </button>
      </div>
    </div>
  );
}
