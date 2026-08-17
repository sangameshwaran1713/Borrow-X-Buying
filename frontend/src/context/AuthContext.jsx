import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const defaultAuthValue = {
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  demoLogin: async () => {},
  fetchCurrentUser: async () => {}
};

const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('borrow_token') || localStorage.getItem('token');
    return savedToken && savedToken !== 'undefined' && savedToken !== 'null' ? savedToken : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Failed to restore user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const saveToken = (authToken) => {
    if (authToken) {
      localStorage.setItem('borrow_token', authToken);
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.require2FA) return data;
    
    const authToken = data.accessToken || data.token;
    saveToken(authToken);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const authToken = data.accessToken || data.token;
    saveToken(authToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('borrow_token');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Demo direct switch account helper
  const demoLogin = async (demoEmail = 'alex@example.com') => {
    return login(demoEmail, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};
