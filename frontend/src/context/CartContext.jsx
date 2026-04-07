import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'persis-cart';

/** $5 off when cart subtotal is at least $30 (matches backend logic). */
export const DISCOUNT_THRESHOLD = 30;
export const DISCOUNT_AMOUNT = 5;

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(lines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Cart line: mirrors what we need for UI and for POST /api/orders.
 */
export function CartProvider({ children }) {
  const [lines, setLines] = useState(loadCart);

  useEffect(() => {
    saveCart(lines);
  }, [lines]);

  const addItem = useCallback((item) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.menuItemId === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: 1,
        },
      ];
    });
  }, []);

  const increment = useCallback((menuItemId) => {
    setLines((prev) =>
      prev.map((l) =>
        l.menuItemId === menuItemId ? { ...l, quantity: l.quantity + 1 } : l
      )
    );
  }, []);

  const decrement = useCallback((menuItemId) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.menuItemId === menuItemId
            ? { ...l, quantity: l.quantity - 1 }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeLine = useCallback((menuItemId) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const cartCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () =>
      Math.round(
        lines.reduce((sum, l) => sum + l.price * l.quantity, 0) * 100
      ) / 100,
    [lines]
  );

  const discount = useMemo(
    () => (subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0),
    [subtotal]
  );

  const total = useMemo(
    () => Math.round((subtotal - discount) * 100) / 100,
    [subtotal, discount]
  );

  const value = useMemo(
    () => ({
      lines,
      addItem,
      increment,
      decrement,
      removeLine,
      clearCart,
      cartCount,
      subtotal,
      discount,
      total,
    }),
    [
      lines,
      addItem,
      increment,
      decrement,
      removeLine,
      clearCart,
      cartCount,
      subtotal,
      discount,
      total,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
