/**
 * Routes API JSON publiques (pour utilisateur connecté)
 * Reproduit api/article.php, api/produit.php, api/panier.php, api/commande.php
 */
const express = require('express');
const { query, execute, pool } = require('../db');
const { requireApiLogin } = require('../middleware/auth');

const router = express.Router();

/* ─── GET /api/article/:id ─────────────────────────────────── */
router.get('/article/:id', requireApiLogin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID manquant.' });
  const rows = await query(
    'SELECT * FROM articles_blog WHERE id = ? AND actif = 1',
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Article introuvable.' });
  res.json(rows[0]);
});

/* ─── GET /api/articles (liste pour la page blog) ──────────── */
router.get('/articles', requireApiLogin, async (req, res) => {
  const rows = await query(
    'SELECT * FROM articles_blog WHERE actif = 1 ORDER BY date_publication DESC'
  );
  res.json({ articles: rows });
});

/* ─── GET /api/produit/:id ─────────────────────────────────── */
router.get('/produit/:id', requireApiLogin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID manquant.' });
  const rows = await query(
    `SELECT p.*, c.nom AS cat_nom
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
      WHERE p.id = ? AND p.actif = 1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(rows[0]);
});

/* ─── GET /api/produits (liste pour la page produits) ─────── */
router.get('/produits', requireApiLogin, async (req, res) => {
  const produits = await query(
    `SELECT p.*, c.nom AS cat_nom
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
      WHERE p.actif = 1
      ORDER BY p.id`
  );
  const categories = await query('SELECT * FROM categories ORDER BY id');
  res.json({ produits, categories });
});

/* ─── GET /api/accueil (stats + produits vedette) ──────────── */
router.get('/accueil', requireApiLogin, async (req, res) => {
  const [[{ nb_produits }]] = await pool.query(
    'SELECT COUNT(*) AS nb_produits FROM produits WHERE actif = 1'
  );
  const [[{ nb_clients }]] = await pool.query(
    "SELECT COUNT(*) AS nb_clients FROM utilisateurs WHERE role = 'client'"
  );
  const [[{ nb_commandes }]] = await pool.query(
    'SELECT COUNT(*) AS nb_commandes FROM commandes'
  );
  const vedettes = await query(
    `SELECT * FROM produits
      WHERE actif = 1 AND badge IS NOT NULL
      ORDER BY id LIMIT 3`
  );
  res.json({
    stats: { nb_produits, nb_clients, nb_commandes },
    vedettes,
  });
});

/* ─── PANIER ───────────────────────────────────────────────── */

// Helper interne : récupère le panier de l'utilisateur courant
async function getCart(userId) {
  return await query(
    `SELECT p.id AS produit_id, p.nom, p.prix, pa.quantite
       FROM panier pa
       JOIN produits p ON pa.produit_id = p.id
      WHERE pa.utilisateur_id = ? AND p.actif = 1`,
    [userId]
  );
}

/* GET /api/panier — lister */
router.get('/panier', requireApiLogin, async (req, res) => {
  const cart = await getCart(req.session.user_id);
  res.json({ success: true, cart });
});

/* POST /api/panier — actions add / remove / qty */
router.post('/panier', requireApiLogin, async (req, res) => {
  try {
    const userId = req.session.user_id;
    const action = String(req.body.action || '');
    const produitId = parseInt(req.body.produit_id, 10);

    if (!produitId) {
      return res.json({ success: false, message: 'Produit invalide.' });
    }

    if (action === 'add') {
      const prodRows = await query(
        'SELECT stock FROM produits WHERE id = ? AND actif = 1',
        [produitId]
      );
      const produit = prodRows[0];
      if (!produit) {
        return res.json({ success: false, message: 'Produit introuvable ou indisponible.' });
      }
      if (produit.stock <= 0) {
        return res.json({ success: false, message: 'Produit épuisé.' });
      }
      const existing = await query(
        'SELECT quantite FROM panier WHERE utilisateur_id = ? AND produit_id = ?',
        [userId, produitId]
      );
      if (existing.length > 0) {
        if (existing[0].quantite >= produit.stock) {
          return res.json({ success: false, message: 'Stock insuffisant.' });
        }
        await execute(
          'UPDATE panier SET quantite = quantite + 1 WHERE utilisateur_id = ? AND produit_id = ?',
          [userId, produitId]
        );
      } else {
        await execute(
          'INSERT INTO panier (utilisateur_id, produit_id, quantite) VALUES (?, ?, 1)',
          [userId, produitId]
        );
      }
    } else if (action === 'remove') {
      await execute(
        'DELETE FROM panier WHERE utilisateur_id = ? AND produit_id = ?',
        [userId, produitId]
      );
    } else if (action === 'qty') {
      const delta = parseInt(req.body.delta, 10) || 0;
      const cur = await query(
        'SELECT quantite FROM panier WHERE utilisateur_id = ? AND produit_id = ?',
        [userId, produitId]
      );
      if (cur.length > 0) {
        const newQty = Math.max(0, cur[0].quantite + delta);
        if (newQty === 0) {
          await execute(
            'DELETE FROM panier WHERE utilisateur_id = ? AND produit_id = ?',
            [userId, produitId]
          );
        } else {
          // Vérifie le stock disponible si on augmente
          if (delta > 0) {
            const stock = await query(
              'SELECT stock FROM produits WHERE id = ?',
              [produitId]
            );
            if (stock[0] && newQty > stock[0].stock) {
              return res.json({ success: false, message: 'Stock insuffisant.' });
            }
          }
          await execute(
            'UPDATE panier SET quantite = ? WHERE utilisateur_id = ? AND produit_id = ?',
            [newQty, userId, produitId]
          );
        }
      }
    } else {
      return res.json({ success: false, message: 'Action inconnue.' });
    }

    const cart = await getCart(userId);
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Panier error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* ─── POST /api/commande ───────────────────────────────────── */
router.post('/commande', requireApiLogin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.session.user_id;
    const b = req.body;

    // Champs livraison + paiement (paiement simulé)
    const required = ['prenom', 'nom', 'email', 'telephone', 'adresse',
      'ville', 'code_postal', 'province', 'card_number', 'card_name'];
    for (const f of required) {
      if (!String(b[f] || '').trim()) {
        req.setFlash && req.setFlash('error', 'Veuillez remplir tous les champs.');
        return res.json({ success: false, message: 'Veuillez remplir tous les champs.' });
      }
    }

    // Récupérer le panier
    const cart = await query(
      `SELECT p.id AS produit_id, p.nom, p.prix, pa.quantite
         FROM panier pa
         JOIN produits p ON pa.produit_id = p.id
        WHERE pa.utilisateur_id = ? AND p.actif = 1`,
      [userId]
    );
    if (cart.length === 0) {
      return res.json({ success: false, message: 'Votre panier est vide.' });
    }

    // Calcul totaux
    let subtotal = 0;
    for (const item of cart) {
      subtotal += parseFloat(item.prix) * parseInt(item.quantite, 10);
    }
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = Math.round((subtotal + taxes) * 100) / 100;
    subtotal = Math.round(subtotal * 100) / 100;

    // Génération numéro commande unique : CMD-YYYYMMDD-NNNN
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    let numero;
    for (let i = 0; i < 50; i++) {
      const n = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
      numero = `CMD-${ymd}-${n}`;
      const check = await query('SELECT id FROM commandes WHERE numero_commande = ?', [numero]);
      if (check.length === 0) break;
    }

    // 4 derniers chiffres
    const cardRaw = String(b.card_number).replace(/\D/g, '');
    const last4 = cardRaw.slice(-4);

    await conn.beginTransaction();

    const [insRes] = await conn.execute(
      `INSERT INTO commandes
       (utilisateur_id, numero_commande, statut,
        prenom_livraison, nom_livraison, email_livraison, telephone_livraison,
        adresse_livraison, ville_livraison, code_postal_livraison, province_livraison,
        nom_carte, quatre_derniers_chiffres,
        sous_total, taxes, total)
       VALUES (?, ?, 'en_attente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, numero,
        b.prenom, b.nom, b.email, b.telephone,
        b.adresse, b.ville, b.code_postal, b.province,
        b.card_name, last4,
        subtotal, taxes, total]
    );
    const commandeId = insRes.insertId;

    for (const item of cart) {
      const sousLigne = Math.round(parseFloat(item.prix) * parseInt(item.quantite, 10) * 100) / 100;
      await conn.execute(
        `INSERT INTO lignes_commande
         (commande_id, produit_id, nom_produit, prix_unitaire, quantite, sous_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [commandeId, item.produit_id, item.nom, item.prix, item.quantite, sousLigne]
      );
      await conn.execute(
        'UPDATE produits SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.quantite, item.produit_id]
      );
    }

    await conn.execute('DELETE FROM panier WHERE utilisateur_id = ?', [userId]);
    await conn.commit();

    req.setFlash('success', `Commande ${numero} confirmée avec succès ! Merci pour votre achat 🎉`);
    res.json({ success: true, numero, redirect: '/pages/client/profil.html' });
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    console.error('Commande error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la commande.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
