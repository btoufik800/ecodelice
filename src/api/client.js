import axios from 'axios';

/**
 * Axios pré-configuré pour parler à l'API Node/Express existante.
 * - baseURL vide : on utilise les chemins relatifs /api/* (le proxy Vite redirige vers :3000)
 * - withCredentials : indispensable pour transmettre le cookie de session (ecodelices.sid)
 */
const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Accept': 'application/json' },
});

export default api;
