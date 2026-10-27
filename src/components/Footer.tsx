import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const { settings } = useCart();

  return (
    <footer className="relative mt-24">
      {/* Wave Transition Top Shape */}
      <div className="w-full overflow-hidden leading-none rotate-180 translate-y-[1px]">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-16 md:h-20 block text-[#fce7ee]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C320,95 480,5 720,50 C960,95 1120,5 1440,45 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Footer Main Content in Moldecito Rose (#fce7ee) */}
      <div className="bg-[#fce7ee] text-gray-900 pt-8 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/assets/logo-moldecito.webp"
                  alt="Moldecito"
                  className="h-9 w-auto object-contain"
                />
                <img
                  src="/assets/logo-text-moldecito.png"
                  alt="moldecito"
                  className="h-6 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-gray-700 leading-relaxed max-w-xs">
                Herramientas de repostería y cortantes de precisión con agarre ergonómico patentado. Fabricación propia en Argentina.
              </p>
            </div>

            {/* Catalog links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-900">
                Catálogo
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li>
                  <Link to="/catalogo" className="hover:text-rosa-700 transition">
                    Todos los Productos
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=cortantes" className="hover:text-rosa-700 transition">
                    Cortantes con Agarre
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=sellos" className="hover:text-rosa-700 transition">
                    Sellos y Marcadores
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo?category=packs" className="hover:text-rosa-700 transition">
                    Packs Especiales
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-900">
                Ayuda & Pedidos
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li>
                  <Link to="/pedido" className="hover:text-rosa-700 transition">
                    Seguimiento de Pedido
                  </Link>
                </li>
                <li>
                  <Link to="/carrito" className="hover:text-rosa-700 transition">
                    Bolsa de Compras
                  </Link>
                </li>
                <li>
                  <Link to="/checkout" className="hover:text-rosa-700 transition">
                    Finalizar Pedido
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-900">
                Contacto
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="text-rosa-600 flex-shrink-0" />
                  <span>{settings.businessInfo.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-emerald-700 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-800 transition font-medium"
                  >
                    +{settings.whatsappNumber}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-rosa-600 flex-shrink-0" />
                  <span>{settings.businessInfo.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-rosa-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
            <p>© {new Date().getFullYear()} Moldecito. Todos los derechos reservados.</p>
            <p>Diseño exclusivo con patente argentina.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
