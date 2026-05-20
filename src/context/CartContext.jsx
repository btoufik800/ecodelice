import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart([]); return; }
    try {
      const { data } = await api.get('/api/panier');
      if (data.success) setCart(data.cart);
    } catch { /* ignore */ }
  }, [user]);

  const sendAction = async (body) => {
    const params = new URLSearchParams(body);
    const { data } = await api.post('/api/panier', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (data.success) setCart(data.cart);
    return data;
  };

  const add    = (produit_id) => sendAction({ action: 'add', produit_id });
  const remove = (produit_id) => sendAction({ action: 'remove', produit_id });
  const qty    = (produit_id, delta) => sendAction({ action: 'qty', produit_id, delta });

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.prix) * i.quantite, 0);
  const taxes = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  const count = cart.reduce((s, i) => s + i.quantite, 0);

  return (
    <CartContext.Provider value={{
      cart, count, subtotal, taxes, total,
      open, setOpen, refresh, add, remove, qty, setCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}
