/**
 * Routes d'authentification — version JSON (React SPA)
 * Toutes les réponses sont JSON : { success, user?, message? }
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { query, execute } = require('../db');

const router = express.Router();

function populateSession(req, user) {
  req.session.user_id = user.id;
  req.session.prenom = user.prenom;
  req.session.nom = user.nom;
  req.session.email = user.email;
  req.session.role = user.role;
  req.session.telephone = user.telephone || '';
  req.session.adresse = user.adresse || '';
  req.session.ville = user.ville || '';
  req.session.code_postal = user.code_postal || '';
  req.session.province = user.province || 'QC';
}

function sessionUser(req) {
  return {
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
  };
}

/* ─── POST /api/auth/login ─────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.json({ success: false, message: 'Veuillez remplir tous les champs.' });
    }
    const rows = await query(
      'SELECT * FROM utilisateurs WHERE email = ? AND actif = 1',
      [email]
    );
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.mot_de_passe)) {
      return res.json({ success: false, message: 'Adresse courriel ou mot de passe incorrect.' });
    }
    populateSession(req, user);
    res.json({ success: true, user: sessionUser(req) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* ─── POST /api/auth/register ──────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const b = req.body;
    const prenom = String(b.prenom || '').trim();
    const nom = String(b.nom || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const password = String(b.password || '');
    const confirm = String(b.confirm_password || '');
    const telephone = String(b.telephone || '').trim();
    const adresse = String(b.adresse || '').trim();
    const ville = String(b.ville || '').trim();
    const code_postal = String(b.code_postal || '').trim();
    const province = String(b.province || 'QC').trim();

    if (!prenom || !nom || !email || !password || !confirm) {
      return res.json({ success: false, message: 'Veuillez remplir tous les champs obligatoires.' });
    }
    if (password.length < 6) {
      return res.json({ success: false, message: 'Le mot de passe doit faire au moins 6 caractères.' });
    }
    if (password !== confirm) {
      return res.json({ success: false, message: 'Les mots de passe ne correspondent pas.' });
    }

    const existing = await query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Cette adresse courriel est déjà utilisée.' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const result = await execute(
      `INSERT INTO utilisateurs
        (email, mot_de_passe, prenom, nom, telephone, adresse, ville, code_postal, province)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hash, prenom, nom, telephone, adresse, ville, code_postal, province]
    );

    const user = {
      id: result.insertId,
      prenom, nom, email, role: 'client',
      telephone, adresse, ville, code_postal, province,
    };
    populateSession(req, user);
    res.json({ success: true, user: sessionUser(req) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création du compte.' });
  }
});

/* ─── POST /api/auth/logout ────────────────────────────────── */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('ecodelices.sid');
    res.json({ success: true });
  });
});

module.exports = router;
