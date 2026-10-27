import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, CheckCircle2 } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { fetchOrderTracking } from '../lib/api';
import { formatCurrency } from '../lib/orderUtils';

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending_payment', label: 'Esperando Pago' },
  { key: 'paid', label: 'Pago Confirmado' },
  { key: 'in_production', label: 'En Producción' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
];

export default function TrackingPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(shortId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(shortId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchOrderTracking(shortId)
      .then((data) => {
        if (!data) {
          setError(`No encontramos el pedido "${shortId}". Verificá que el código sea correcto.`);
          setOrder(null);
        } else {
          setOrder(data);
        }
      })
      .catch(() => {
        setError('Error al consultar el estado del pedido.');
      })
      .finally(() => setLoading(false));
  }, [shortId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/pedido/${encodeURIComponent(searchInput.trim().toUpperCase())}`);
    }
  };

  const getStepIndex = (status?: OrderStatus) => {
    if (!status) return 0;
    if (status === 'cancelled') return -1;
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getStepIndex(order?.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Seguimiento de Pedido
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Ingresá el código de tu pedido (ej: <strong>PED-8492L</strong>).
        </p>

        <form onSubmit={handleSearchSubmit} className="max-w-sm mx-auto flex gap-2 pt-3">
          <input
            type="text"
            placeholder="PED-XXXXL"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#151515] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition"
          >
            Buscar
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs text-gray-400">
          Consultando estado...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-600">
          {error}
        </div>
      )}

      {order && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block">Código</span>
              <h2 className="text-xl font-bold text-gray-900">#{order.shortId}</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
              {order.status === 'pending_payment' && 'Pendiente de pago'}
              {order.status === 'paid' && 'Pago confirmado'}
              {order.status === 'in_production' && 'En producción'}
              {order.status === 'shipped' && 'Enviado'}
              {order.status === 'delivered' && 'Entregado'}
              {order.status === 'cancelled' && 'Cancelado'}
            </span>
          </div>

          {/* Stepper */}
          {order.status !== 'cancelled' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'border-black bg-gray-50'
                        : isCompleted
                        ? 'border-gray-300 text-gray-800'
                        : 'border-gray-100 text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          <div className="bg-[#fbf8f9] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200/60 pb-2">
              Productos
            </h3>

            <div className="divide-y divide-gray-200/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-gray-900 block">{item.name}</span>
                    <span className="text-gray-500">{item.qty} uds × {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200/60 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{order.totals.shipping === 0 ? 'Gratis' : formatCurrency(order.totals.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm pt-2 border-t border-gray-200/60">
                <span>Total</span>
                <span>{formatCurrency(order.totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
