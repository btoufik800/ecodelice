import { useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Contact() {
  const { user } = useAuth();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) params.append(k, v);
    const { data } = await api.post('/api/client/contact', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    show(data.message || 'Message envoyé.', data.success ? 'ok' : 'err');
    if (data.success) e.target.reset();
    setBusy(false);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">Nous <span className="accent">contacter</span></h1>
          <p className="section-subtitle">Une question ? Une suggestion ? Écrivez-nous !</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          <div className="profile-card">
            <h3>📨 Envoyer un message</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Nom complet *</label><input name="nom" defaultValue={`${user?.prenom || ''} ${user?.nom || ''}`.trim()} required /></div>
              <div className="form-group"><label>Courriel *</label><input type="email" name="email" defaultValue={user?.email} required /></div>
              <div className="form-group"><label>Téléphone</label><input name="telephone" defaultValue={user?.telephone || ''} /></div>
              <div className="form-group"><label>Message *</label><textarea name="message" rows={6} required></textarea></div>
              <button type="submit" className="btn-submit" disabled={busy}>{busy ? '…' : 'Envoyer →'}</button>
            </form>
          </div>

          <div>
            <div className="profile-card">
              <h3>📍 Notre adresse</h3>
              <p>123 Rue des Érables<br />Montréal (QC) H2X 1Y4<br />Canada</p>
            </div>
            <div className="profile-card">
              <h3>📞 Téléphone</h3>
              <p>+1 (514) 555-0123</p>
            </div>
            <div className="profile-card">
              <h3>✉️ Courriel</h3>
              <p>info@ecodelices.ca</p>
            </div>
            <div className="profile-card">
              <h3>🕐 Horaires</h3>
              <p>Lundi-Vendredi : 9h-18h<br />Samedi : 10h-17h<br />Dimanche : fermé</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
