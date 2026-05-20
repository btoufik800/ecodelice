/**
 * Routes admin
 *   - dashboard, commandes, produits, utilisateurs, messages
 */
const express = require('express');
const { query, execute, pool } = require('../db');
const { requireApiAdmin } = require('../middleware/auth');

const router = express.Router();

/* ─── GET /api/admin/dashboard ─────────────────────────────── */
router.get('/dashboard', requireApiAdmin, async (req, res) => {
  const [[{ nb_clients }]] = await pool.query(
    "SELECT COUNT(*) AS nb_clients FROM utilisateurs WHERE role = 'client'"
  );
  const [[{ nb_commandes }]] = await pool.query(
    'SELECT COUNT(*) AS nb_commandes FROM commandes'
  );
  const [[{ revenus }]] = await pool.query(
    "SELECT COALESCE(SUM(total), 0) AS revenus FROM commandes WHERE statut != 'annulee'"
  );
  const [[{ nb_produits }]] = await pool.query(
    'SELECT COUNT(*) AS nb_produits FROM produits WHERE actif = 1'
  );

  const dernieres_commandes = await query(
    `SELECT c.*, u.prenom, u.nom
       FROM commandes c
       JOIN utilisateurs u ON c.utilisateur_id = u.id
      ORDER BY c.date_commande DESC LIMIT 6`
  );

  const derniers_inscrits = await query(
    'SELECT id, prenom, nom, email, role, date_creation FROM utilisateurs ORDER BY date_creation DESC LIMIT 5'
  );

  res.json({
    stats: {
      nb_clients: Number(nb_clients),
      nb_commandes: Number(nb_commandes),
      revenus: Number(revenus),
      nb_produits: Number(nb_produits),
    },
    dernieres_commandes,
    derniers_inscrits,
  });
});

/* ─── COMMANDES ────────────────────────────────────────────── */

const STATUTS_VALIDES = ['en_attente', 'confirmee', 'en_preparation', 'expedie', 'livree', 'annulee'];

router.get('/commandes', requireApiAdmin, async (req, res) => {
  const commandes = await query(
    `SELECT c.*, u.prenom, u.nom, u.email,
            (SELECT COALESCE(SUM(quantite),0) FROM lignes_commande WHERE commande_id = c.id) AS nb_articles
       FROM commandes c
       JOIN utilisateurs u ON c.utilisateur_id = u.id
      ORDER BY c.date_commande DESC`
  );
  const [[{ total_count }]] = await pool.query('SELECT COUNT(*) AS total_count FROM commandes');
  const [[{ en_attente }]] = await pool.query(
    "SELECT COUNT(*) AS en_attente FROM commandes WHERE statut = 'en_attente'"
  );
  const [[{ revenus }]] = await pool.query(
    "SELECT COALESCE(SUM(total),0) AS revenus FROM commandes WHERE statut != 'annulee'"
  );
  res.json({
    commandes,
    stats: {
      total: Number(total_count),
      en_attente: Number(en_attente),
      revenus: Number(revenus),
    },
  });
});

router.post('/commande/statut', requireApiAdmin, async (req, res) => {
  const id = parseInt(req.body.commande_id, 10);
  const statut = String(req.body.statut || '');
  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return res.json({ success: false, message: 'Données invalides.' });
  }
  await execute('UPDATE commandes SET statut = ? WHERE id = ?', [statut, id]);
  res.json({ success: true, message: 'Statut mis à jour ✓' });
});

router.get('/commande/:id', requireApiAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cmds = await query(
    `SELECT c.*, u.prenom, u.nom, u.email FROM commandes c
       JOIN utilisateurs u ON c.utilisateur_id = u.id
      WHERE c.id = ?`,
    [id]
  );
  if (!cmds[0]) return res.status(404).json({ error: 'Commande introuvable.' });
  const lignes = await query('SELECT * FROM lignes_commande WHERE commande_id = ?', [id]);
  res.json({ commande: cmds[0], lignes });
});

/* ─── PRODUITS ─────────────────────────────────────────────── */

router.get('/produits', requireApiAdmin, async (req, res) => {
  const produits = await query(
    `SELECT p.*, c.nom AS cat_nom
       FROM produits p
       LEFT JOIN categories c ON p.categorie_id = c.id
      ORDER BY p.actif DESC, p.id DESC`
  );
  const categories = await query('SELECT * FROM categories ORDER BY id');
  res.json({ produits, categories });
});

router.post('/produits', requireApiAdmin, async (req, res) => {
  try {
    const action = String(req.body.action || '');
    const b = req.body;

    if (action === 'add' || action === 'edit') {
      const nom = String(b.nom || '').trim();
      const prix = parseFloat(b.prix);
      if (!nom || isNaN(prix) || prix <= 0) {
        return res.json({ success: false, message: 'Le nom et un prix valide sont obligatoires.' });
      }
      const categorie_id = b.categorie_id ? parseInt(b.categorie_id, 10) : null;
      const stock = parseInt(b.stock, 10) || 0;
      const format = String(b.format || 'Pot de 250ml').trim();
      const badge = String(b.badge || '').trim() || null;
      const description = String(b.description || '').trim();
      const ingredients = String(b.ingredients || '').trim();

      if (action === 'add') {
        await execute(
          `INSERT INTO produits
            (categorie_id, nom, description, ingredients, prix, stock, format, badge)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [categorie_id, nom, description, ingredients, prix, stock, format, badge]
        );
        return res.json({ success: true, message: 'Produit ajouté ✓' });
      } else {
        const id = parseInt(b.id, 10);
        if (!id) return res.json({ success: false, message: 'ID manquant.' });
        await execute(
          `UPDATE produits SET
             categorie_id = ?, nom = ?, description = ?, ingredients = ?,
             prix = ?, stock = ?, format = ?, badge = ?
           WHERE id = ?`,
          [categorie_id, nom, description, ingredients, prix, stock, format, badge, id]
        );
        return res.json({ success: true, message: 'Produit modifié ✓' });
      }
    } else if (action === 'delete') {
      const id = parseInt(b.id, 10);
      await execute('UPDATE produits SET actif = 0 WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Produit désactivé.' });
    } else if (action === 'restore') {
      const id = parseInt(b.id, 10);
      await execute('UPDATE produits SET actif = 1 WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Produit réactivé.' });
    }
    res.json({ success: false, message: 'Action inconnue.' });
  } catch (err) {
    console.error('Admin produits error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* ─── UTILISATEURS ─────────────────────────────────────────── */

router.get('/utilisateurs', requireApiAdmin, async (req, res) => {
  const utilisateurs = await query(
    `SELECT u.id, u.email, u.prenom, u.nom, u.telephone, u.role, u.actif, u.date_creation,
            (SELECT COUNT(*) FROM commandes WHERE utilisateur_id = u.id) AS nb_commandes
       FROM utilisateurs u
      ORDER BY u.date_creation DESC`
  );
  res.json({ utilisateurs, currentUserId: req.session.user_id });
});

router.post('/utilisateur', requireApiAdmin, async (req, res) => {
  try {
    const id = parseInt(req.body.user_id, 10);
    const action = String(req.body.action || '');
    if (!id) return res.json({ success: false, message: 'ID manquant.' });
    if (id === req.session.user_id) {
      return res.json({ success: false, message: 'Vous ne pouvez pas modifier votre propre compte.' });
    }
    if (action === 'promote') {
      await execute("UPDATE utilisateurs SET role = 'admin' WHERE id = ?", [id]);
      return res.json({ success: true, message: 'Utilisateur promu administrateur.' });
    }
    if (action === 'demote') {
      await execute("UPDATE utilisateurs SET role = 'client' WHERE id = ?", [id]);
      return res.json({ success: true, message: 'Rôle ramené à client.' });
    }
    if (action === 'toggle') {
      await execute('UPDATE utilisateurs SET actif = 1 - actif WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Statut du compte modifié.' });
    }
    res.json({ success: false, message: 'Action inconnue.' });
  } catch (err) {
    console.error('Admin utilisateur error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* ─── MESSAGES CONTACT ─────────────────────────────────────── */

router.get('/messages', requireApiAdmin, async (req, res) => {
  const messages = await query(
    'SELECT * FROM messages_contact ORDER BY date_envoi DESC'
  );
  // marquer tous comme lus
  await execute('UPDATE messages_contact SET lu = 1 WHERE lu = 0');
  res.json({ messages });
});

router.post('/message', requireApiAdmin, async (req, res) => {
  const id = parseInt(req.body.id, 10);
  const action = String(req.body.action || '');
  if (!id) return res.json({ success: false, message: 'ID manquant.' });
  if (action === 'delete') {
    await execute('DELETE FROM messages_contact WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Message supprimé.' });
  }
  if (action === 'mark_read') {
    await execute('UPDATE messages_contact SET lu = 1 WHERE id = ?', [id]);
    return res.json({ success: true });
  }
  res.json({ success: false, message: 'Action inconnue.' });
});

/* ─── ARTICLES BLOG (admin CRUD) ───────────────────────────── */

router.get('/articles', requireApiAdmin, async (req, res) => {
  const articles = await query(
    `SELECT a.*, u.prenom, u.nom
       FROM articles_blog a
       LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      ORDER BY a.actif DESC, a.date_publication DESC`
  );
  res.json({ articles });
});

router.post('/articles', requireApiAdmin, async (req, res) => {
  try {
    const action = String(req.body.action || '');
    const b = req.body;
    if (action === 'add' || action === 'edit') {
      const titre = String(b.titre || '').trim();
      const extrait = String(b.extrait || '').trim();
      const contenu = String(b.contenu || '').trim();
      const categorie = String(b.categorie || '').trim();
      if (!titre || !contenu || !['recettes', 'actualites', 'conseils'].includes(categorie)) {
        return res.json({ success: false, message: 'Titre, contenu et catégorie valides obligatoires.' });
      }
      if (action === 'add') {
        await execute(
          `INSERT INTO articles_blog (auteur_id, titre, extrait, contenu, categorie)
           VALUES (?, ?, ?, ?, ?)`,
          [req.session.user_id, titre, extrait, contenu, categorie]
        );
        return res.json({ success: true, message: 'Article publié ✓' });
      } else {
        const id = parseInt(b.id, 10);
        await execute(
          `UPDATE articles_blog SET titre=?, extrait=?, contenu=?, categorie=? WHERE id=?`,
          [titre, extrait, contenu, categorie, id]
        );
        return res.json({ success: true, message: 'Article modifié ✓' });
      }
    }
    if (action === 'delete') {
      const id = parseInt(b.id, 10);
      await execute('UPDATE articles_blog SET actif = 0 WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Article retiré.' });
    }
    if (action === 'restore') {
      const id = parseInt(b.id, 10);
      await execute('UPDATE articles_blog SET actif = 1 WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Article republié.' });
    }
    res.json({ success: false, message: 'Action inconnue.' });
  } catch (err) {
    console.error('Admin articles error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
