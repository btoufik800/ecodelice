import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recharge l'utilisateur depuis /api/me
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/me');
      setUser(data.loggedIn ? data.user : null);
      return data;
    } catch {
      setUser(null);
      return { loggedIn: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /**
   * Connexion : on poste en form-urlencoded (l'API existante répond par redirection).
   * Après la requête, on rafraîchit /api/me pour récupérer l'utilisateur.
   */
  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    await api.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // L'API redirige (3xx) -> on laisse axios suivre, le cookie est posé
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }).catch(() => { /* redirection 3xx attendue */ });
    const me = await refresh();
    return me.loggedIn ? me.user : null;
  };

  const register = async (form) => {
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => params.append(k, v ?? ''));
    await api.post('/api/auth/register', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }).catch(() => { /* redirection 3xx attendue */ });
    const me = await refresh();
    return me.loggedIn ? me.user : null;
  };

  const logout = async () => {
    await api.get('/api/auth/logout').catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
