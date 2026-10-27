import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/orderUtils';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQty,
    totals,
    settings,
    selectedZone,
    setSelectedZone,
  } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Bolsa de Compras ({items.reduce((acc, i) => acc + i.qty, 0)})
            </h2>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1 text-gray-400 hover:text-black transition"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <p className="text-sm text-gray-500">Tu bolsa está vacía.</p>
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    navigate('/catalogo');
                  }}
                  className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black hover:text-white transition"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const itemBreakdown = totals.breakdown.find((b) => b.productId === item.productId);

                  return (
                    <div key={item.productId} className="py-4 flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-black p-0.5 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          {formatCurrency(item.unitPrice)}
                        </div>

                        {/* Qty & Line Total */}
                        <div className="pt-1 flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty - 1)}
                              className="p-1 text-gray-500 hover:text-black"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-900">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty + 1)}
                              className="p-1 text-gray-500 hover:text-black"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-gray-900">
                            {formatCurrency(itemBreakdown?.lineTotal || item.unitPrice * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer & Totals */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
              {/* Shipping zone select */}
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
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-black"
                >
                  {settings.shippingZones.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} ({formatCurrency(z.cost)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary lines */}
              <div className="space-y-1.5 text-xs text-gray-600">
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
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#151515] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.16em] rounded-full transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Iniciar Pedido</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
