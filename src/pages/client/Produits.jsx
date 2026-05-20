import { useEffect, useState, useMemo } from 'react';
import api from '../../api/client.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const { add } = useCart();
  const { show } = useToast();

  useEffect(() => {
    api.get('/api/produits').then(({ data }) => {
      setProduits(data.produits);
      setCategories(data.categories);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return produits;
    return produits.filter((p) => String(p.categorie_id) === String(filter));
  }, [produits, filter]);

  const addCart = async (id) => {
    const r = await add(id);
    if (r.success) show('Ajouté au panier 🛒', 'ok');
    else show(r.message || 'Erreur', 'err');
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">Nos <span className="accent">confitures</span></h1>
          <p className="section-subtitle">Toutes nos saveurs artisanales</p>
        </div>

        <div className="filters-bar">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Toutes ({produits.length})
          </button>
          {categories.map((c) => (
            <button key={c.id} className={`filter-btn ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
              {c.nom}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filtered.map((p) => (
            <div key={p.id} className="product-card">
              {p.badge && <span className="product-badge">{p.badge}</span>}
              <div className="product-emoji">🍓</div>
              <div className="product-name">{p.nom}</div>
              <div className="product-format">{p.format}</div>
              <div className="product-price">{Number(p.prix).toFixed(2)} $</div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.8rem' }}>
                <button className="btn btn-outline" onClick={() => setDetail(p)} style={{ flex: 1 }}>Détails</button>
                <button className="btn btn-primary" onClick={() => addCart(p.id)} disabled={p.stock <= 0} style={{ flex: 1 }}>
                  {p.stock > 0 ? '🛒 Ajouter' : 'Épuisé'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            Aucun produit dans cette catégorie.
          </p>
        )}
      </div>

      {detail && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setDetail(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{detail.nom}</h2>
              <button className="modal-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-label">Description</div>
              <div className="detail-value">{detail.description || '—'}</div>
              <div className="detail-label">Ingrédients</div>
              <div className="detail-value">{detail.ingredients || '—'}</div>
              <div className="detail-label">Format</div>
              <div className="detail-value">{detail.format}</div>
              <div className="detail-label">Prix</div>
              <div className="detail-price">{Number(detail.prix).toFixed(2)} $</div>
              <button className="btn-submit" style={{ marginTop: '1.5rem' }}
                onClick={() => { addCart(detail.id); setDetail(null); }}>
                🛒 Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
