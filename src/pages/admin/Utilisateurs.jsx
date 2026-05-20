import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Utilisateurs() {
  const [data, setData] = useState({ utilisateurs: [], currentUserId: null });
  const { show } = useToast();

  const load = () => api.get('/api/admin/utilisateurs').then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  const act = async (user_id, action) => {
    const params = new URLSearchParams({ user_id, action });
    const { data: r } = await api.post('/api/admin/utilisateur', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    show(r.message, r.success ? 'ok' : 'err');
    if (r.success) load();
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '2rem' }}>👥 Utilisateurs</h1>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th><th>Email</th><th>Tél.</th><th>Rôle</th>
              <th>Statut</th><th>Commandes</th><th>Inscrit le</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.utilisateurs.map((u) => (
              <tr key={u.id} style={{ opacity: u.actif ? 1 : .5 }}>
                <td><strong>{u.prenom} {u.nom}</strong></td>
                <td>{u.email}</td>
                <td>{u.telephone || '—'}</td>
                <td>
                  <span style={{
                    padding: '.2rem .6rem', borderRadius: 10, fontSize: '.75rem',
                    background: u.role === 'admin' ? '#fde68a' : '#e0f2fe',
                    color: u.role === 'admin' ? '#92400e' : '#075985',
                  }}>{u.role}</span>
                </td>
                <td>{u.actif ? '✅ Actif' : '🚫 Désactivé'}</td>
                <td>{u.nb_commandes}</td>
                <td>{new Date(u.date_creation).toLocaleDateString('fr-CA')}</td>
                <td>
                  {u.id === data.currentUserId
                    ? <em style={{ color: '#999' }}>(vous)</em>
                    : (
                      <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                        {u.role === 'client'
                          ? <button className="btn-tiny" onClick={() => act(u.id, 'promote')}>↑ Admin</button>
                          : <button className="btn-tiny" onClick={() => act(u.id, 'demote')}>↓ Client</button>
                        }
                        <button className="btn-tiny btn-tiny-danger" onClick={() => act(u.id, 'toggle')}>
                          {u.actif ? '🚫' : '✅'}
                        </button>
                      </div>
                    )
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
