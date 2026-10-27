import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { Product, Category } from '../types';
import { fetchProducts, fetchCategories } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: currentCategory || undefined,
      search: currentSearch || undefined,
      sort: currentSort,
      page: currentPage,
      limit: 16,
    })
      .then((res) => {
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateParam = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    if (key !== 'page') {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div className="text-center space-y-2 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {currentCategory
            ? categories.find((c) => c.slug === currentCategory)?.name || 'Catálogo'
            : 'Catálogo de Modelos'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Diseño propio e impresión de alta definición con agarre ergonómico.
        </p>
      </div>

      {/* Clean Category Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParam('category', null)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition ${
              !currentCategory
                ? 'bg-[#151515] text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full whitespace-nowrap transition ${
                currentCategory === cat.slug
                  ? 'bg-[#151515] text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', null);
                }}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700">
            <ArrowUpDown size={13} className="text-gray-500" />
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="-createdAt">Nuevos</option>
              <option value="basePrice">Menor precio</option>
              <option value="-basePrice">Mayor precio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-base font-semibold text-gray-800">
            No se encontraron productos con esos filtros.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-5 py-2.5 border border-gray-900 text-gray-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition"
          >
            Ver todos los modelos
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => updateParam('page', String(currentPage - 1))}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-500 px-3">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                type="button"
                disabled={currentPage >= pagination.pages}
                onClick={() => updateParam('page', String(currentPage + 1))}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-gray-50 transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
