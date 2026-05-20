import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartSidebar from '../components/CartSidebar.jsx';

const LINKS = [
  ['/accueil',  'Accueil'],
  ['/produits', 'Nos produits'],
  ['/blog',     'Blogue'],
  ['/apropos',  'À propos'],
  ['/contact',  'Contact'],
  ['/profil',   'Mon profil'],
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const { count, setOpen, refresh } = useCart();
  const loc = useLocation();

  // Rafraîchit le panier à chaque navigation
  useEffect(() => { refresh(); }, [loc.pathname, refresh]);

  return (
    <>
      <nav className="navbar" id="mainNav">
        <div className="nav-inner">
          <NavLink className="nav-logo" to="/accueil">
            <span className="eco">Éco</span><span className="del">Délices</span>
          </NavLink>
          <ul className="nav-links" id="navLinks">
            {LINKS.map(([to, lbl]) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>{lbl}</NavLink>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <span className="nav-greeting">👋 {user?.prenom}</span>
            <button className="nav-cart-btn" onClick={() => setOpen(true)} aria-label="Panier">
              🛒<span className="cart-badge">{count}</span>
            </button>
            <button onClick={logout} className="btn-nav btn-nav-outline">Déconnexion</button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>

      <footer style={{ background: '#1b1b1b', color: '#cfcfcf', padding: '3rem 0 1rem', marginTop: '4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: '.5rem' }}>
            <span style={{ color: 'var(--primary-light)' }}>Éco</span>Délices
          </div>
          <p style={{ opacity: .7, fontSize: '.9rem' }}>
            Confitures artisanales biologiques du Québec — © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      <CartSidebar />
    </>
  );
}
