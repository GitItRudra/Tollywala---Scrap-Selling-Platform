import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tollywala_admin_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then((data) => {
        if (!data.user.isAdmin) {
          throw new Error('Not an admin account');
        }
        setUser(data.user);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('tollywala_admin_token');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const data = await api.login({ email, password });
    if (!data.user.isAdmin) {
      throw new Error('This account does not have admin access.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tollywala_admin_token', data.token);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tollywala_admin_token');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
