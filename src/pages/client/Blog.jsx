import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/articles').then(({ data }) => setArticles(data.articles || []));
  }, []);

  const filtered = filter === 'all' ? articles : articles.filter((a) => a.categorie === filter);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">Notre <span className="accent">blogue</span></h1>
          <p className="section-subtitle">Recettes, conseils, actualités</p>
        </div>

        <div className="filters-bar">
          {['all', 'recettes', 'actualites', 'conseils'].map((c) => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'Tous' : c}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {filtered.map((a) => (
            <article key={a.id} className="blog-card" onClick={() => setOpen(a)}>
              <div className="blog-cat">{a.categorie}</div>
              <h3 className="blog-title">{a.titre}</h3>
              <p className="blog-extrait">{a.extrait}</p>
              <div className="blog-meta">
                {new Date(a.date_publication).toLocaleDateString('fr-CA')}
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            Aucun article pour le moment.
          </p>
        )}
      </div>

      {open && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setOpen(null)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{open.titre}</h2>
              <button className="modal-close" onClick={() => setOpen(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '.78rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '.5rem' }}>
                {open.categorie} · {new Date(open.date_publication).toLocaleDateString('fr-CA')}
              </div>
              <div style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>{open.contenu}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
