import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  ['/admin/dashboard',    '📊 Tableau de bord'],
  ['/admin/commandes',    '📦 Commandes'],
  ['/admin/produits',     '🍓 Produits'],
  ['/admin/utilisateurs', '👥 Utilisateurs'],
  ['/admin/messages',     '💬 Messages'],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-wrap" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="admin-sidebar" style={{
        width: 260, background: 'linear-gradient(180deg, var(--primary-dark), var(--primary))',
        color: '#fff', padding: '1.5rem 0', position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem', fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>
          Éco<span style={{ color: 'var(--primary-xlight)' }}>Délices</span>
          <div style={{ fontSize: '.7rem', opacity: .8, marginTop: 4, fontWeight: 600, letterSpacing: '.4px' }}>ADMIN</div>
        </div>

        <nav style={{ flex: 1 }}>
          {LINKS.map(([to, lbl]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'block', padding: '.85rem 1.5rem', color: '#fff',
                textDecoration: 'none', fontFamily: 'Montserrat,sans-serif',
                fontWeight: 600, fontSize: '.9rem',
                background: isActive ? 'rgba(255,255,255,.18)' : 'transparent',
                borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
                transition: 'all .2s',
              })}
            >{lbl}</NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,.2)' }}>
          <div style={{ fontSize: '.8rem', opacity: .8, marginBottom: '.5rem' }}>
            👤 {user?.prenom} {user?.nom}
          </div>
          <button onClick={logout} style={{
            width: '100%', padding: '.6rem', background: 'rgba(255,255,255,.15)',
            color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8,
            cursor: 'pointer', fontFamily: 'Montserrat,sans-serif', fontWeight: 600
          }}>Déconnexion</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem 2.5rem', background: '#f6f8f5' }}>
        <Outlet />
      </main>
    </div>
  );
}
