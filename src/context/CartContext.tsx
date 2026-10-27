import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { CartItem, Product, ShippingZone, CartTotals, SiteSettings } from '../types';
import { calculateCartTotals } from '../lib/orderUtils';
import { fetchSettings, DEFAULT_SETTINGS, getProductImageUrl } from '../lib/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  totals: CartTotals;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  selectedZone: ShippingZone | undefined;
  setSelectedZone: (zone: ShippingZone | undefined) => void;
  settings: SiteSettings;
  toast: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'moldecito_cart_items';
const ZONE_KEY = 'moldecito_shipping_zone';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [selectedZone, setSelectedZoneState] = useState<ShippingZone | undefined>(() => {
    try {
      const saved = localStorage.getItem(ZONE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS.shippingZones[0];
    } catch {
      return DEFAULT_SETTINGS.shippingZones[0];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load backend settings on mount
  useEffect(() => {
    fetchSettings().then((s) => {
      setSettings(s);
      if (!selectedZone && s.shippingZones.length > 0) {
        setSelectedZoneState(s.shippingZones[0]);
      }
    });
  }, []);

  // Save items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not persist cart to localStorage', e);
    }
  }, [items]);

  const setSelectedZone = (zone: ShippingZone | undefined) => {
    setSelectedZoneState(zone);
    try {
      if (zone) localStorage.setItem(ZONE_KEY, JSON.stringify(zone));
      else localStorage.removeItem(ZONE_KEY);
    } catch {}
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 2800);
  };

  const addItem = (product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          qty,
          unitPrice: product.basePrice,
          image: getProductImageUrl(product.images?.[0]),
        },
      ];
    });
    showToast(`¡Agregado al carrito: ${product.name}!`);
    setIsDrawerOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const totals = useMemo(
    () => calculateCartTotals(items, selectedZone, settings.volumeDiscounts),
    [items, selectedZone, settings.volumeDiscounts]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        itemCount,
        totals,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        selectedZone,
        setSelectedZone,
        settings,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

