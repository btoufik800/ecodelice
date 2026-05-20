import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(null);
  const { show } = useToast();

  const load = () => api.get('/api/admin/messages').then(({ data }) => setMessages(data.messages));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    const params = new URLSearchParams({ id, action: 'delete' });
    const { data } = await api.post('/api/admin/message', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    show(data.message, data.success ? 'ok' : 'err');
    if (data.success) { load(); setOpen(null); }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Montserrat,sans-serif', marginBottom: '2rem' }}>💬 Messages de contact</h1>

      <div className="admin-card">
        {messages.length === 0
          ? <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Aucun message reçu.</p>
          : (
            <table className="admin-table">
              <thead><tr><th>Date</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Aperçu</th><th></th></tr></thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} style={{ fontWeight: m.lu ? 400 : 700 }}>
                    <td>{new Date(m.date_envoi).toLocaleString('fr-CA')}</td>
                    <td>{m.nom}</td>
                    <td>{m.email}</td>
                    <td>{m.telephone || '—'}</td>
                    <td>{m.message.slice(0, 60)}{m.message.length > 60 ? '…' : ''}</td>
                    <td>
                      <button className="btn-tiny" onClick={() => setOpen(m)}>👁</button>{' '}
                      <button className="btn-tiny btn-tiny-danger" onClick={() => remove(m.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {open && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setOpen(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Message de {open.nom}</h2>
              <button className="modal-close" onClick={() => setOpen(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Email :</strong> {open.email}</p>
              <p><strong>Téléphone :</strong> {open.telephone || '—'}</p>
              <p><strong>Date :</strong> {new Date(open.date_envoi).toLocaleString('fr-CA')}</p>
              <hr style={{ margin: '1rem 0' }} />
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{open.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
