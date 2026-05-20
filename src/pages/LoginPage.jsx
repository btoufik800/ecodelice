import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { show } = useToast();
  const [tab, setTab] = useState('login');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const onLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setFlash(null);
    const fd = new FormData(e.currentTarget);
    const r = await login(fd.get('email'), fd.get('password'));
    setBusy(false);
    if (r.ok) show(`Bon retour, ${r.user.prenom} !`, 'ok');
    else setFlash({ type: 'error', msg: r.message || 'Erreur de connexion.' });
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setBusy(true); setFlash(null);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    if (data.password !== data.confirm_password) {
      setBusy(false);
      return setFlash({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' });
    }
    const r = await register(data);
    setBusy(false);
    if (r.ok) show(`Bienvenue ${r.user.prenom} !`, 'ok');
    else setFlash({ type: 'error', msg: r.message || 'Erreur lors de l\'inscription.' });
  };

  return (
    <div className="hero-section">
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>
      <div className="hero-blob blob-3"></div>

      <div className="hero-grid">
        <div className="hero-info">
          <div className="hero-brand anim-pop"><span className="eco">Éco</span>Délices</div>
          <p className="hero-tagline anim-up delay-1">Confitures artisanales 100% biologiques</p>
          <p className="hero-desc anim-up delay-2">
            Découvrez nos confitures fabriquées avec passion à partir de fruits biologiques locaux,
            cueillis à maturité dans les vergers du Québec. Une explosion de saveurs authentiques
            dans chaque pot.
          </p>
          <div className="hero-features anim-up delay-3">
            <div className="hero-feat"><span className="hero-feat-icon">🌱</span><span className="hero-feat-text">100% Biologique</span></div>
            <div className="hero-feat"><span className="hero-feat-icon">🚜</span><span className="hero-feat-text">Producteurs locaux</span></div>
            <div className="hero-feat"><span className="hero-feat-icon">👨‍🍳</span><span className="hero-feat-text">Fait artisanalement</span></div>
            <div className="hero-feat"><span className="hero-feat-icon">♻️</span><span className="hero-feat-text">Zéro déchet</span></div>
          </div>
        </div>

        <div className="auth-card anim-right">
          {flash && (
            <div className={`flash flash-${flash.type === 'success' ? 'success' : 'error'}`}>
              {flash.type === 'success' ? '✅' : '⚠️'} {flash.msg}
            </div>
          )}

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Connexion</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Inscription</button>
          </div>

          {tab === 'login' ? (
            <form className="form-visible" onSubmit={onLogin}>
              <div className="form-group">
                <label>Adresse courriel</label>
                <input type="email" name="email" required placeholder="votre@email.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" required placeholder="••••••••" autoComplete="current-password" />
              </div>
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? '…' : 'Se connecter →'}
              </button>
              <div className="admin-hint" style={{ marginTop: '1.2rem' }}>
                <strong>🔑 Compte de test :</strong><br />
                admin@ecodelices.ca &nbsp;|&nbsp; admin123
              </div>
            </form>
          ) : (
            <form className="form-visible" onSubmit={onRegister}>
              <div className="form-row">
                <div className="form-group"><label>Prénom *</label><input type="text" name="prenom" required /></div>
                <div className="form-group"><label>Nom *</label><input type="text" name="nom" required /></div>
              </div>
              <div className="form-group">
                <label>Adresse courriel *</label>
                <input type="email" name="email" required autoComplete="email" />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Mot de passe *</label><input type="password" name="password" required minLength={6} /></div>
                <div className="form-group"><label>Confirmer *</label><input type="password" name="confirm_password" required minLength={6} /></div>
              </div>
              <div className="form-group"><label>Téléphone</label><input type="tel" name="telephone" placeholder="514-555-0123" /></div>
              <div className="form-group"><label>Adresse</label><input type="text" name="adresse" placeholder="123 Rue des Érables" /></div>
              <div className="form-row">
                <div className="form-group"><label>Ville</label><input type="text" name="ville" placeholder="Montréal" /></div>
                <div className="form-group"><label>Code postal</label><input type="text" name="code_postal" placeholder="H2X 1Y4" /></div>
              </div>
              <div className="form-group">
                <label>Province</label>
                <select name="province" defaultValue="QC">
                  <option value="QC">Québec</option>
                  <option value="ON">Ontario</option>
                  <option value="BC">Colombie-Britannique</option>
                  <option value="AB">Alberta</option>
                  <option value="MB">Manitoba</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="NS">Nouvelle-Écosse</option>
                  <option value="NB">Nouveau-Brunswick</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? '…' : 'Créer mon compte →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
