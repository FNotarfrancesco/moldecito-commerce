import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/orderUtils';
import { createOrderDraft } from '../lib/api';

const checkoutFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(8, 'Ingresá un número de teléfono válido (ej: 11 1234-5678)'),
  email: z.string().email('Ingresá un email válido'),
  address: z.string().min(5, 'Ingresá la dirección completa (calle y altura)'),
  city: z.string().min(2, 'Ingresá la localidad o ciudad'),
  zip: z.string().regex(/^\d{4}$/, 'El código postal debe tener 4 dígitos (ej: 1832)'),
  zone: z.string().min(1, 'Seleccioná una zona de envío'),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { items, totals, settings, selectedZone, setSelectedZone, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    zone: selectedZone?.name || settings.shippingZones[0]?.name || '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; url: string } | null>(null);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">No hay productos en tu bolsa</h2>
        <Link
          to="/catalogo"
          className="inline-block px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black hover:text-white transition"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'zone') {
      const z = settings.shippingZones.find((item) => item.name === value);
      setSelectedZone(z);
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutFormSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        formattedErrors[field] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        customer: {
          name: formData.name,
          phone: formData.phone.startsWith('+54') ? formData.phone : `+54 9 ${formData.phone}`,
          email: formData.email,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          zone: formData.zone,
        },
        notes: formData.notes,
      };

      const response = await createOrderDraft(payload);

      setOrderComplete({ id: response.orderId, url: response.whatsappUrl });
      clearCart();

      window.open(response.whatsappUrl, '_blank');
    } catch (err: any) {
      alert(`Hubo un problema al crear la orden: ${err.message || 'Error de conexión'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 text-gray-900 flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Pedido #{orderComplete.id}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Abrimos WhatsApp con el detalle de tu compra para confirmar los datos y el pago.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <a
            href={orderComplete.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#151515] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full transition"
          >
            Abrir WhatsApp
          </a>

          <Link
            to={`/pedido/${orderComplete.id}`}
            className="w-full py-3.5 border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-full hover:border-black transition"
          >
            Ver Seguimiento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          to="/carrito"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-3 transition"
        >
          <ArrowLeft size={13} />
          <span>Volver a la bolsa</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                Datos de Contacto
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Laura Rossi"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full text-xs p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    WhatsApp (Celular) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="11 1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full text-xs p-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="laura@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full text-xs p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                Dirección de Entrega
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Zona de Envío *
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-black"
                >
                  {settings.shippingZones.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.name} — {formatCurrency(z.cost)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dirección (Calle, altura, piso/depto) *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Av. Hipólito Yrigoyen 8500, Piso 3"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full text-xs p-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Localidad / Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Lomas de Zamora"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full text-xs p-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                  />
                  {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Código Postal (4 dígitos) *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    maxLength={4}
                    placeholder="1832"
                    value={formData.zip}
                    onChange={handleChange}
                    className={`w-full text-xs p-3 rounded-lg border ${errors.zip ? 'border-red-500' : 'border-gray-200'} bg-white focus:outline-none focus:border-black`}
                  />
                  {errors.zip && <p className="text-[11px] text-red-500 mt-1">{errors.zip}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Indicaciones para la entrega o preparación..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#151515] hover:bg-black disabled:opacity-50 text-white font-bold text-xs uppercase tracking-[0.16em] rounded-full transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generando pedido...</span>
                  </>
                ) : (
                  <span>Enviar Pedido a WhatsApp</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#fbf8f9] rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 border-b border-gray-200/60 pb-2">
              Resumen de Compra ({items.reduce((acc, i) => acc + i.qty, 0)})
            </h3>

            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-white border border-gray-200" />
                    <div>
                      <span className="font-medium text-gray-900 line-clamp-1">{item.name}</span>
                      <span className="text-gray-400 text-[11px]">Cant: {item.qty}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.unitPrice * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200/60 pt-3">
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
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200/60">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
