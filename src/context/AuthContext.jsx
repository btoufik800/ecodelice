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

  // Connexion : POST JSON, le backend pose le cookie de session et renvoie l'user
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.success) {
        setUser(data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, message: data.message };
    } catch (err) {
      return { ok: false, message: 'Impossible de joindre le serveur. Vérifiez qu\'il est démarré.' };
    }
  };

  const register = async (form) => {
    try {
      const { data } = await api.post('/api/auth/register', form);
      if (data.success) {
        setUser(data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, message: data.message };
    } catch (err) {
      return { ok: false, message: 'Impossible de joindre le serveur.' };
    }
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
