import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ANNOUNCEMENTS = [
  'Envíos a todo el país',
  'Envío gratis desde $60.000 en CABA, Zona Sur y La Plata',
];

export default function Navbar() {
  const { itemCount, openDrawer, settings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setIsFading(false);
      }, 350);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Cortantes', path: '/catalogo?category=cortantes' },
    { name: 'Sellos', path: '/catalogo?category=sellos' },
    { name: 'Packs', path: '/catalogo?category=packs' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      {/* Top announcement bar with smooth rotation */}
      <div className="bg-[#151515] text-white text-[11px] font-semibold tracking-[0.16em] uppercase text-center overflow-hidden h-9 px-4 flex items-center justify-center">
        <span
          className={`inline-block transition-all duration-300 transform ${
            isFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          {ANNOUNCEMENTS[announcementIdx]}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 hover:text-black transition"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Brand Logo - Centered on mobile, Left on desktop like Pura Vida */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/assets/logo-moldecito.webp"
                alt="Moldecito"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <img
                src="/assets/logo-text-moldecito.png"
                alt="moldecito"
                className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname + location.search === link.path;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[13px] font-semibold tracking-[0.08em] uppercase transition relative py-1 ${
                    isActive
                      ? 'text-rosa-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rosa-600'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-gray-700 hover:text-black transition"
              aria-label="Buscar"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hola Moldecito! Quería hacer una consulta.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/40 text-[13px] font-semibold tracking-wide transition group"
              title="Contacto por WhatsApp"
            >
              <MessageCircle size={17} strokeWidth={1.8} className="flex-shrink-0 transition group-hover:text-emerald-600" />
              <span className="leading-none pt-[1px]">Escribinos</span>
            </a>

            {/* Cart Icon with sleek counter badge */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 text-gray-800 hover:text-black transition"
              aria-label="Carrito"
            >
              <ShoppingBag size={21} strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-0 bg-rosa-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Search Overlay */}
        {searchOpen && (
          <div className="py-4 border-t border-gray-100 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <input
                type="text"
                autoFocus
                placeholder="Buscar cortante, flor, número, sello..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition"
              />
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img src="/assets/logo-moldecito.webp" alt="Moldecito" className="h-8 w-auto" />
                  <img src="/assets/logo-text-moldecito.png" alt="moldecito" className="h-5 w-auto" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-500 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-sm font-semibold tracking-wider uppercase text-gray-800 hover:text-rosa-600 transition"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/pedido"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-sm font-semibold tracking-wider uppercase text-gray-500 hover:text-black transition"
                >
                  Seguir mi Pedido
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hola Moldecito!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#151515] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Directo</span>
              </a>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
