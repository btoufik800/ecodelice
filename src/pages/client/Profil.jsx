import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Profil() {
  const { refresh } = useAuth();
  const { show } = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/api/client/profil').then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) params.append(k, v);
    const { data: r } = await api.post('/api/client/profil', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (r.success) { show(r.message, 'ok'); refresh(); load(); }
    else show(r.message || 'Erreur', 'err');
    setBusy(false);
  };

  if (!data) return <p style={{ padding: '4rem', textAlign: 'center' }}>Chargement…</p>;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">Mon <span className="accent">profil</span></h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatBox n={data.stats.nb_commandes} label="Commandes passées" />
          <StatBox n={`${Number(data.stats.total_depense).toFixed(2)} $`} label="Total dépensé" />
        </div>

        <div className="profile-card">
          <h3>📝 Mes informations</h3>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="form-group"><label>Prénom *</label><input name="prenom" defaultValue={data.user.prenom} required /></div>
              <div className="form-group"><label>Nom *</label><input name="nom" defaultValue={data.user.nom} required /></div>
            </div>
            <div className="form-group"><label>Courriel</label><input value={data.user.email} disabled /></div>
            <div className="form-group"><label>Téléphone</label><input name="telephone" defaultValue={data.user.telephone || ''} /></div>
            <div className="form-group"><label>Adresse</label><input name="adresse" defaultValue={data.user.adresse || ''} /></div>
            <div className="form-row">
              <div className="form-group"><label>Ville</label><input name="ville" defaultValue={data.user.ville || ''} /></div>
              <div className="form-group"><label>Code postal</label><input name="code_postal" defaultValue={data.user.code_postal || ''} /></div>
              <div className="form-group">
                <label>Province</label>
                <select name="province" defaultValue={data.user.province || 'QC'}>
                  <option>QC</option><option>ON</option><option>BC</option><option>AB</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={busy}>
              {busy ? '…' : 'Enregistrer'}
            </button>
          </form>
        </div>

        <h3 style={{ marginTop: '2rem' }}>📦 Mes commandes</h3>
        {data.commandes.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>Vous n'avez pas encore passé de commande.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.commandes.map((c) => (
              <div key={c.id} className="profile-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong>{c.numero_commande}</strong>
                    <div style={{ fontSize: '.85rem', color: 'var(--text-med)' }}>
                      {new Date(c.date_commande).toLocaleDateString('fr-CA')} · {c.nb_articles} article(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(c.total).toFixed(2)} $</div>
                    <span className={`statut-badge statut-${c.statut}`}>{c.statut.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const StatBox = ({ n, label }) => (
  <div className="profile-card" style={{ textAlign: 'center', margin: 0 }}>
    <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
    <div style={{ color: 'var(--text-med)', fontWeight: 600 }}>{label}</div>
  </div>
);
