/**
 * Routes côté client (utilisateur connecté) :
 *   - profil (GET infos + commandes, POST mise à jour)
 *   - contact (POST envoi message)
 */
const express = require('express');
const { query, execute } = require('../db');
const { requireApiLogin } = require('../middleware/auth');

const router = express.Router();

/* ─── GET /api/client/profil ──────────────────────────────── */
router.get('/profil', requireApiLogin, async (req, res) => {
  const userId = req.session.user_id;

  const userRows = await query(
    'SELECT id, email, prenom, nom, telephone, adresse, ville, code_postal, province, role, date_creation FROM utilisateurs WHERE id = ?',
    [userId]
  );
  const user = userRows[0];
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const commandes = await query(
    'SELECT * FROM commandes WHERE utilisateur_id = ? ORDER BY date_commande DESC',
    [userId]
  );

  // Pour chaque commande, compter le nombre d'articles
  const commandesAvecNb = await Promise.all(commandes.map(async (cmd) => {
    const [{ nb }] = await query(
      'SELECT COALESCE(SUM(quantite), 0) AS nb FROM lignes_commande WHERE commande_id = ?',
      [cmd.id]
    );
    return { ...cmd, nb_articles: Number(nb) };
  }));

  // Stats : total dépensé (hors annulées)
  const [{ total_depense }] = await query(
    "SELECT COALESCE(SUM(total), 0) AS total_depense FROM commandes WHERE utilisateur_id = ? AND statut != 'annulee'",
    [userId]
  );

  res.json({
    user,
    commandes: commandesAvecNb,
    stats: {
      nb_commandes: commandes.length,
      total_depense: Number(total_depense),
    },
  });
});

/* ─── GET /api/client/commande/:id (détails d'une commande) ─ */
router.get('/commande/:id', requireApiLogin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'ID manquant.' });

  const cmds = await query(
    'SELECT * FROM commandes WHERE id = ? AND utilisateur_id = ?',
    [id, req.session.user_id]
  );
  if (!cmds[0]) return res.status(404).json({ error: 'Commande introuvable.' });

  const lignes = await query(
    'SELECT * FROM lignes_commande WHERE commande_id = ?',
    [id]
  );
  res.json({ commande: cmds[0], lignes });
});

/* ─── POST /api/client/profil — mise à jour infos ─────────── */
router.post('/profil', requireApiLogin, async (req, res) => {
  try {
    const userId = req.session.user_id;
    const b = req.body;
    const prenom = String(b.prenom || '').trim();
    const nom = String(b.nom || '').trim();

    if (!prenom || !nom) {
      return res.json({ success: false, message: 'Le prénom et le nom sont obligatoires.' });
    }

    const telephone = String(b.telephone || '').trim();
    const adresse = String(b.adresse || '').trim();
    const ville = String(b.ville || '').trim();
    const code_postal = String(b.code_postal || '').trim();
    const province = String(b.province || 'QC').trim();

    await execute(
      `UPDATE utilisateurs SET
         prenom = ?, nom = ?, telephone = ?, adresse = ?,
         ville = ?, code_postal = ?, province = ?
       WHERE id = ?`,
      [prenom, nom, telephone, adresse, ville, code_postal, province, userId]
    );

    // Mettre à jour la session
    req.session.prenom = prenom;
    req.session.nom = nom;
    req.session.telephone = telephone;
    req.session.adresse = adresse;
    req.session.ville = ville;
    req.session.code_postal = code_postal;
    req.session.province = province;

    res.json({ success: true, message: 'Profil mis à jour avec succès ✓' });
  } catch (err) {
    console.error('Update profil error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* ─── POST /api/client/contact — envoyer message ──────────── */
router.post('/contact', requireApiLogin, async (req, res) => {
  try {
    const nom = String(req.body.nom || '').trim();
    const email = String(req.body.email || '').trim();
    const telephone = String(req.body.telephone || '').trim();
    const message = String(req.body.message || '').trim();

    if (!nom || !email || !message) {
      return res.json({ success: false, message: 'Les champs nom, courriel et message sont obligatoires.' });
    }

    await execute(
      'INSERT INTO messages_contact (nom, email, telephone, message) VALUES (?, ?, ?, ?)',
      [nom, email, telephone, message]
    );
    res.json({ success: true, message: 'Votre message a été envoyé ! Nous vous répondrons sous 24h.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
