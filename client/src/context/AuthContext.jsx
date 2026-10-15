import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session token on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('dealkart_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('[Auth]: Stale or invalid session token. Clearing...');
          localStorage.removeItem('dealkart_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const userData = res.data.data;
      localStorage.setItem('dealkart_token', userData.token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const userData = res.data.data;
      localStorage.setItem('dealkart_token', userData.token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('dealkart_token');
    setUser(null);
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    if (res.data?.success) {
      setUser((prev) => ({ ...prev, ...res.data.data }));
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
