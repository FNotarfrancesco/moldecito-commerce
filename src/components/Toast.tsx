import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div className="bg-oscuro-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-rosa-500/30 text-xs font-semibold">
        <CheckCircle2 size={18} className="text-emerald-400" />
        <span>{toast}</span>
      </div>
    </div>
  );
}

