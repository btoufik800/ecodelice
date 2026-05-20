/**
 * Pool de connexions MySQL (mysql2/promise)
 * Remplace l'ancienne fonction PHP getDB() basée sur PDO.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecodelices_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true, // les DATETIME sortent comme "2026-05-01 12:34:56"
});

/**
 * Helper : exécute une requête et retourne les rows.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Helper : exécute une requête INSERT/UPDATE/DELETE et retourne le résultat brut
 * (insertId, affectedRows...).
 */
async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * Test de connexion au démarrage du serveur.
 */
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✓ Connexion MySQL OK (base : ' + (process.env.DB_NAME || 'ecodelices_db') + ')');
  } catch (err) {
    console.error('\n❌ Impossible de se connecter à MySQL.');
    console.error('   Message :', err.message);
    console.error('\n   ✓ Vérifiez que MySQL est démarré (XAMPP / WAMP / service).');
    console.error('   ✓ Vérifiez la base ecodelices_db (importez database/schema.sql).');
    console.error('   ✓ Vérifiez les variables DB_* dans le fichier .env.\n');
  }
}

module.exports = { pool, query, execute, testConnection };
