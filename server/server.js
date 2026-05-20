/**
 * ÉcoDélices — serveur principal (version unifiée React + Node)
 * Stack : Node.js + Express + MySQL (mysql2)
 *
 * Mode développement :
 *   - Backend (ici) : http://localhost:3009  (API uniquement)
 *   - Frontend Vite : http://localhost:5173  (proxy /api → :300)
 *
 * Mode production :
 *   - npm run build → génère ../dist/
 *   - npm start     → Express sert l'API + le dist/ React sur le port 3000
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
// Charge le .env situé dans le dossier server/, peu importe d'où on lance node
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./src/db');
const authRoutes   = require('./src/routes/auth');
const apiRoutes    = require('./src/routes/api');
const clientRoutes = require('./src/routes/client');
const adminRoutes  = require('./src/routes/admin');
const { isLoggedIn } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3009;

/* ─── CORS (autorise Vite en dev sur :5173) ─────────────────── */
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

/* ─── Parsers ───────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Sessions ──────────────────────────────────────────────── */
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecodelices-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'lax',
  },
  name: 'ecodelices.sid',
}));

/* ─── Flash messages ────────────────────────────────────────── */
app.use((req, res, next) => {
  req.setFlash = (type, msg) => { req.session.flash = { type, msg }; };
  req.getFlash = () => {
    if (!req.session.flash) return null;
    const f = req.session.flash; delete req.session.flash; return f;
  };
  next();
});

/* ─── Endpoint /api/me ──────────────────────────────────────── */
app.get('/api/me', (req, res) => {
  if (!isLoggedIn(req)) return res.json({ loggedIn: false });
  res.json({
    loggedIn: true,
    user: {
      user_id: req.session.user_id,
      prenom: req.session.prenom,
      nom: req.session.nom,
      email: req.session.email,
      role: req.session.role,
      telephone: req.session.telephone || '',
      adresse: req.session.adresse || '',
      ville: req.session.ville || '',
      code_postal: req.session.code_postal || '',
      province: req.session.province || 'QC',
    },
    flash: req.getFlash(),
  });
});

/* ─── Routes API ────────────────────────────────────────────── */
app.use('/api/auth',   authRoutes);
app.use('/api',        apiRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin',  adminRoutes);

/* ─── Production : sert le build React (dist/) ──────────────── */
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // Fallback SPA : toutes les routes non-API renvoient index.html
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
} else {
  // Mode dev : pas encore de build → message d'aide à la racine
  app.get('/', (req, res) => {
    res.type('html').send(`
      <div style="font-family:sans-serif;padding:3rem;max-width:600px;margin:auto">
        <h1>🌿 ÉcoDélices — API</h1>
        <p>Le backend Node est démarré sur le port ${PORT}.</p>
        <p>En <b>développement</b>, ouvrez le frontend Vite : <a href="http://localhost:5173">http://localhost:5173</a></p>
        <p>En <b>production</b>, lancez <code>npm run build</code> à la racine pour générer <code>dist/</code>,
           puis cette page servira l'app React.</p>
      </div>`);
  });
}

/* ─── 404 API ───────────────────────────────────────────────── */
app.use('/api', (req, res) => res.status(404).json({ error: 'Route API introuvable.' }));

/* ─── Erreurs ───────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'Erreur serveur.' });
  res.status(500).send('Erreur serveur.');
});

/* ─── Démarrage ─────────────────────────────────────────────── */
app.listen(PORT, async () => {
  console.log('\n🌿 ÉcoDélices — serveur démarré');
  console.log(`   ► http://localhost:${PORT}`);
  await testConnection();
  console.log('\nCompte admin par défaut : admin@ecodelices.ca / admin123\n');
});
