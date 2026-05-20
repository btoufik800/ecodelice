import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import ClientLayout from './layouts/ClientLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Auth
import LoginPage from './pages/LoginPage.jsx';

// Client pages
import Accueil from './pages/client/Accueil.jsx';
import Produits from './pages/client/Produits.jsx';
import Profil from './pages/client/Profil.jsx';
import Contact from './pages/client/Contact.jsx';
import APropos from './pages/client/APropos.jsx';
import Blog from './pages/client/Blog.jsx';

// Admin pages
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminUtilisateurs from './pages/admin/Utilisateurs.jsx';
import AdminCommandes from './pages/admin/Commandes.jsx';
import AdminProduits from './pages/admin/Produits.jsx';
import AdminMessages from './pages/admin/Messages.jsx';

/* ─── Route guards ─────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/accueil" replace />;
  return children;
}
function FullLoader() {
  return (
    <div className="loader-wrap" style={{ opacity: 1, pointerEvents: 'auto' }}>
      <div className="loader-logo">Éco<span>Délices</span></div>
    </div>
  );
}

/* ─── Routeur principal ────────────────────────────────────── */
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullLoader />;

  return (
    <Routes>
      {/* Page d'accueil = login si non connecté, sinon redirection */}
      <Route
        path="/"
        element={
          !user
            ? <LoginPage />
            : user.role === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/accueil" replace />
        }
      />

      {/* Espace client */}
      <Route element={<RequireAuth><ClientLayout /></RequireAuth>}>
        <Route path="/accueil"  element={<Accueil />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/profil"   element={<Profil />} />
        <Route path="/contact"  element={<Contact />} />
        <Route path="/apropos"  element={<APropos />} />
        <Route path="/blog"     element={<Blog />} />
      </Route>

      {/* Espace admin */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="utilisateurs"  element={<AdminUtilisateurs />} />
        <Route path="commandes"     element={<AdminCommandes />} />
        <Route path="produits"      element={<AdminProduits />} />
        <Route path="messages"      element={<AdminMessages />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>404 — Page introuvable</h1>
          <a href="/">← Retour à l'accueil</a>
        </div>
      } />
    </Routes>
  );
}
