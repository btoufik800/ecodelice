import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Accueil() {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: { nb_produits: 0, nb_clients: 0, nb_commandes: 0 }, vedettes: [] });

  useEffect(() => {
    api.get('/api/accueil').then(({ data }) => setData(data)).catch(() => {});
  }, []);

  return (
    <>
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light))',
        color: '#fff', padding: '6rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, fontSize: '20rem', opacity: .05, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>🍓</div>
        <div className="container" style={{ position: 'relative' }}>
          <h1 className="anim-up" style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '3.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Bienvenue, {user?.prenom} ! 👋
          </h1>
          <p className="anim-up delay-1" style={{ fontSize: '1.2rem', opacity: .92, marginBottom: '2.5rem', fontStyle: 'italic' }}>
            Découvrez nos confitures artisanales biologiques du Québec
          </p>
          <div className="anim-up delay-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/produits" className="btn btn-white">🛒 Voir nos produits</Link>
            <Link to="/apropos"  className="btn btn-outline-white">En savoir plus</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <Stat n={data.stats.nb_produits} label="Saveurs disponibles" />
            <Stat n={data.stats.nb_clients} label="Clients satisfaits" />
            <Stat n={data.stats.nb_commandes} label="Commandes livrées" />
          </div>
        </div>
      </section>

      {data.vedettes?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">Nos <span className="accent">coups de cœur</span></h2>
              <p className="section-subtitle">Sélectionnés avec soin parmi nos meilleures saveurs</p>
            </div>
            <div className="products-grid">
              {data.vedettes.map((p) => (
                <div key={p.id} className="product-card">
                  {p.badge && <span className="product-badge">{p.badge}</span>}
                  <div className="product-emoji">🍓</div>
                  <div className="product-name">{p.nom}</div>
                  <div className="product-format">{p.format}</div>
                  <div className="product-price">{Number(p.prix).toFixed(2)} $</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/produits" className="btn btn-primary">Voir tous nos produits →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Pourquoi <span className="accent">ÉcoDélices</span> ?</h2>
            <p className="section-subtitle">Ce qui nous distingue depuis notre création</p>
          </div>
          <div className="features-grid">
            <Feature icon="🌿" title="100% Biologique" desc="Tous nos fruits proviennent d'agriculteurs certifiés bio. Pas de pesticides, pas d'OGM." />
            <Feature icon="🚜" title="Local & Saisonnier" desc="Nous travaillons exclusivement avec des producteurs québécois dans un rayon de 100 km." />
            <Feature icon="👐" title="Artisanal" desc="Chaque pot est préparé à la main, en petite quantité, selon les recettes traditionnelles." />
            <Feature icon="💚" title="Éco-responsable" desc="Emballages recyclables, zéro gaspillage alimentaire, compensation carbone de nos livraisons." />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Prêt à découvrir nos saveurs ? 🍓</h2>
          <p className="cta-desc">Commandez maintenant et recevez vos confitures fraîches directement chez vous.</p>
          <div className="cta-btns">
            <Link to="/produits" className="btn btn-white">🛒 Faire mes achats</Link>
            <Link to="/contact"  className="btn btn-outline-white">💬 Nous contacter</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const Stat = ({ n, label }) => (
  <div className="reveal visible">
    <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
    <div style={{ color: 'var(--text-med)', fontFamily: 'Montserrat,sans-serif', fontWeight: 600 }}>{label}</div>
  </div>
);

const Feature = ({ icon, title, desc }) => (
  <div className="feature-item reveal visible">
    <div className="feature-icon">{icon}</div>
    <div className="feature-title">{title}</div>
    <div className="feature-desc">{desc}</div>
  </div>
);
