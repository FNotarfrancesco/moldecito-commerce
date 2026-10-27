import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/orderUtils';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQty,
    clearCart,
    totals,
    settings,
    selectedZone,
    setSelectedZone,
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-28 px-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Tu bolsa está vacía</h1>
        <p className="text-xs text-gray-500">
          Aún no agregaste productos a tu bolsa.
        </p>
        <div className="pt-2">
          <Link
            to="/catalogo"
            className="inline-block px-8 py-3.5 bg-[#151515] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Bolsa de Compras
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-black transition"
        >
          Vaciar bolsa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="divide-y divide-gray-100 border-b border-gray-100">
            {items.map((item) => {
              const breakdown = totals.breakdown.find((b) => b.productId === item.productId);

              return (
                <div key={item.productId} className="py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-18 h-18 rounded-xl object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <Link
                        to={`/producto/${item.slug}`}
                        className="font-medium text-sm text-gray-900 hover:text-rosa-600 transition line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-full px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="p-1 text-gray-500 hover:text-black"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-gray-900">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="p-1 text-gray-500 hover:text-black"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-gray-900 w-20 text-right">
                      {formatCurrency(breakdown?.lineTotal || item.unitPrice * item.qty)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-black p-1 transition"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition pt-2"
          >
            <ArrowLeft size={14} />
            <span>Seguir comprando</span>
          </Link>
        </div>

        {/* Totals Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#fbf8f9] rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
              Resumen
            </h3>

            {/* Shipping selection */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Zona de Envío
              </label>
              <select
                value={selectedZone?.name || ''}
                onChange={(e) => {
                  const zone = settings.shippingZones.find((z) => z.name === e.target.value);
                  setSelectedZone(zone);
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none"
              >
                {settings.shippingZones.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.name} ({formatCurrency(z.cost)})
                  </option>
                ))}
              </select>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200/60 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-rosa-600 font-semibold">
                  <span>Descuento aplicado</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{totals.shipping === 0 ? 'Gratis' : formatCurrency(totals.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200/60">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-[#151515] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.16em] rounded-full transition flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
