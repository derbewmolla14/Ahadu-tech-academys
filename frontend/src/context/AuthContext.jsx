import { createContext, useCallback, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (_error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  }, []);

  const registerAccount = useCallback(async (formData) => {
    const response = await api.post('/auth/register', formData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  }, []);

  const updateProfile = useCallback(async (formData) => {
    const response = await api.patch('/auth/me', formData);
    setUser(response.data.user);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadProfile,
        registerAccount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
