/**
 * Middlewares d'authentification basés sur express-session.
 * Reproduit le comportement des helpers PHP isLoggedIn/isAdmin/requireLogin/requireAdmin.
 */

function isLoggedIn(req) {
  return Boolean(req.session && req.session.user_id);
}

function isAdmin(req) {
  return Boolean(req.session && req.session.role === 'admin');
}

/**
 * Pour pages HTML protégées : redirige vers / si non connecté.
 */
function requireLogin(req, res, next) {
  if (!isLoggedIn(req)) return res.redirect('/');
  next();
}

/**
 * Pour pages admin : redirige vers / si non admin.
 */
function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.redirect('/');
  next();
}

/**
 * Pour endpoints API JSON : renvoie 401 JSON si non connecté.
 */
function requireApiLogin(req, res, next) {
  if (!isLoggedIn(req)) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }
  next();
}

/**
 * Pour endpoints API admin : renvoie 403 JSON si non admin.
 */
function requireApiAdmin(req, res, next) {
  if (!isLoggedIn(req)) return res.status(401).json({ error: 'Non autorisé.' });
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès admin requis.' });
  next();
}

module.exports = {
  isLoggedIn,
  isAdmin,
  requireLogin,
  requireAdmin,
  requireApiLogin,
  requireApiAdmin,
};
