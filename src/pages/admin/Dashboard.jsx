import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/admin/dashboard').then(({ data }) => setData(data));
  }, []);

  if (!data) return <p>Chargement…</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '2rem' }}>📊 Tableau de bord</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card icon="👥" label="Clients" n={data.stats.nb_clients} />
        <Card icon="📦" label="Commandes" n={data.stats.nb_commandes} />
        <Card icon="💰" label="Revenus" n={`${Number(data.stats.revenus).toFixed(2)} $`} />
        <Card icon="🍓" label="Produits actifs" n={data.stats.nb_produits} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Panel title="📦 Dernières commandes">
          {data.dernieres_commandes.length === 0
            ? <p style={{ color: '#999' }}>Aucune commande.</p>
            : (
              <table className="admin-table">
                <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th></tr></thead>
                <tbody>
                  {data.dernieres_commandes.map((c) => (
                    <tr key={c.id}>
                      <td>{c.numero_commande}</td>
                      <td>{c.prenom} {c.nom}</td>
                      <td>{new Date(c.date_commande).toLocaleDateString('fr-CA')}</td>
                      <td>{Number(c.total).toFixed(2)} $</td>
                      <td><span className={`statut-badge statut-${c.statut}`}>{c.statut.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </Panel>

        <Panel title="🆕 Derniers inscrits">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.derniers_inscrits.map((u) => (
              <li key={u.id} style={{ padding: '.6rem 0', borderBottom: '1px solid #eee' }}>
                <strong>{u.prenom} {u.nom}</strong>
                <div style={{ fontSize: '.8rem', color: '#777' }}>{u.email} · {u.role}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

const Card = ({ icon, label, n }) => (
  <div className="admin-card">
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
    <div style={{ color: 'var(--text-med)', fontWeight: 600 }}>{label}</div>
  </div>
);

const Panel = ({ title, children }) => (
  <div className="admin-card" style={{ textAlign: 'left' }}>
    <h3 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </div>
);
