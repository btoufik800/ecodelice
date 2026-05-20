import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

const STATUTS = ['en_attente', 'confirmee', 'en_preparation', 'expedie', 'livree', 'annulee'];

export default function Commandes() {
  const [data, setData] = useState({ commandes: [], stats: { total: 0, en_attente: 0, revenus: 0 } });
  const [detail, setDetail] = useState(null);
  const { show } = useToast();

  const load = () => api.get('/api/admin/commandes').then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  const changeStatut = async (id, statut) => {
    const params = new URLSearchParams({ commande_id: id, statut });
    const { data: r } = await api.post('/api/admin/commande/statut', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    show(r.message, r.success ? 'ok' : 'err');
    if (r.success) load();
  };

  const openDetail = async (id) => {
    const { data } = await api.get(`/api/admin/commande/${id}`);
    setDetail(data);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '2rem' }}>📦 Commandes</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card label="Total commandes" n={data.stats.total} />
        <Card label="En attente" n={data.stats.en_attente} />
        <Card label="Revenus" n={`${Number(data.stats.revenus).toFixed(2)} $`} />
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Articles</th><th>Total</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {data.commandes.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.numero_commande}</strong></td>
                <td>{c.prenom} {c.nom}<br /><small>{c.email}</small></td>
                <td>{new Date(c.date_commande).toLocaleDateString('fr-CA')}</td>
                <td>{c.nb_articles}</td>
                <td>{Number(c.total).toFixed(2)} $</td>
                <td>
                  <select className="statut-select" value={c.statut} onChange={(e) => changeStatut(c.id, e.target.value)}>
                    {STATUTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </td>
                <td><button className="btn-tiny" onClick={() => openDetail(c.id)}>👁 Détails</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setDetail(null)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Commande {detail.commande.numero_commande}</h2>
              <button className="modal-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Client :</strong> {detail.commande.prenom} {detail.commande.nom} ({detail.commande.email})</p>
              <p><strong>Livraison :</strong> {detail.commande.adresse_livraison}, {detail.commande.ville_livraison} {detail.commande.code_postal_livraison}</p>
              <p><strong>Paiement :</strong> Carte se terminant par {detail.commande.quatre_derniers_chiffres}</p>

              <h3 style={{ marginTop: '1.5rem' }}>Articles</h3>
              <table className="admin-table">
                <thead><tr><th>Produit</th><th>Prix unit.</th><th>Qté</th><th>Sous-total</th></tr></thead>
                <tbody>
                  {detail.lignes.map((l) => (
                    <tr key={l.id}>
                      <td>{l.nom_produit}</td>
                      <td>{Number(l.prix_unitaire).toFixed(2)} $</td>
                      <td>{l.quantite}</td>
                      <td>{Number(l.sous_total).toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', marginTop: '1rem' }}>
                Sous-total : {Number(detail.commande.sous_total).toFixed(2)} $<br />
                Taxes : {Number(detail.commande.taxes).toFixed(2)} $<br />
                <strong style={{ fontSize: '1.2rem' }}>Total : {Number(detail.commande.total).toFixed(2)} $</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Card = ({ label, n }) => (
  <div className="admin-card">
    <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
    <div style={{ color: 'var(--text-med)', fontWeight: 600 }}>{label}</div>
  </div>
);
