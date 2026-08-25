import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tollywala_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        localStorage.removeItem('tollywala_token');
      })
      .finally(() => setLoading(false));
  }, [token]);

  function saveSession(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tollywala_token', data.token);
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    saveSession(data);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    saveSession(data);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tollywala_token');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
