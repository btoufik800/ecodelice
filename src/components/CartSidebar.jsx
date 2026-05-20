import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../api/client.js';

export default function CartSidebar() {
  const { user } = useAuth();
  const { cart, total, subtotal, taxes, open, setOpen, qty, remove, setCart } = useCart();
  const { show } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={close}></div>
      <div className={`cart-sidebar ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Mon Panier</h2>
          <button className="cart-close-btn" onClick={close} aria-label="Fermer">×</button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <span className="big-icon">🛒</span>
              <p>Votre panier est vide</p>
            </div>
          ) : cart.map((item) => (
            <div key={item.produit_id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.nom}</div>
                <div className="cart-item-price">{Number(item.prix).toFixed(2)} $</div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => qty(item.produit_id, -1)}>−</button>
                <span className="qty-value">{item.quantite}</span>
                <button className="qty-btn" onClick={() => qty(item.produit_id, +1)}>+</button>
              </div>
              <div className="cart-item-subtotal">
                <strong>{(item.prix * item.quantite).toFixed(2)} $</strong>
                <button onClick={() => remove(item.produit_id)} style={{
                  background: 'none', border: 'none', color: '#c33', cursor: 'pointer', fontSize: '.85rem'
                }}>Retirer</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div style={{ fontSize: '.8rem', color: 'var(--text-med)', marginBottom: '.3rem' }}>
            Sous-total : {subtotal.toFixed(2)} $ &nbsp;·&nbsp; Taxes : {taxes.toFixed(2)} $
          </div>
          <div className="cart-total-row">
            <span>Total TTC</span>
            <span className="cart-total-price">{total.toFixed(2)} $</span>
          </div>
          <button className="btn-checkout"
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}>
            Commander →
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          user={user}
          onClose={() => setShowCheckout(false)}
          onSuccess={(numero) => {
            show(`Commande ${numero} confirmée ! 🎉`, 'ok');
            setCart([]);
            setShowCheckout(false);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function CheckoutModal({ user, onClose, onSuccess }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) params.append(k, v);
    try {
      const { data } = await api.post('/api/commande', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (data.success) onSuccess(data.numero);
      else setErr(data.message || 'Erreur');
    } catch (e) {
      setErr('Erreur serveur.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>📦 Finaliser ma commande</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {err && <div className="flash flash-error">⚠️ {err}</div>}
          <form onSubmit={submit}>
            <h3 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '.8rem' }}>Livraison</h3>
            <div className="form-row">
              <div className="form-group"><label>Prénom</label><input name="prenom" defaultValue={user?.prenom} required /></div>
              <div className="form-group"><label>Nom</label><input name="nom" defaultValue={user?.nom} required /></div>
            </div>
            <div className="form-group"><label>Courriel</label><input type="email" name="email" defaultValue={user?.email} required /></div>
            <div className="form-group"><label>Téléphone</label><input name="telephone" defaultValue={user?.telephone} required /></div>
            <div className="form-group"><label>Adresse</label><input name="adresse" defaultValue={user?.adresse} required /></div>
            <div className="form-row">
              <div className="form-group"><label>Ville</label><input name="ville" defaultValue={user?.ville} required /></div>
              <div className="form-group"><label>Code postal</label><input name="code_postal" defaultValue={user?.code_postal} required /></div>
              <div className="form-group">
                <label>Province</label>
                <select name="province" defaultValue={user?.province || 'QC'}>
                  <option value="QC">QC</option><option value="ON">ON</option><option value="BC">BC</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontFamily: 'Montserrat,sans-serif', marginTop: '1.5rem', marginBottom: '.8rem' }}>Paiement (simulé)</h3>
            <div className="form-group"><label>Nom sur la carte</label><input name="card_name" required /></div>
            <div className="form-group"><label>Numéro de carte</label><input name="card_number" placeholder="4242 4242 4242 4242" required /></div>

            <button type="submit" className="btn-submit" disabled={busy} style={{ marginTop: '1.5rem' }}>
              {busy ? '…' : 'Confirmer la commande →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
