import { createContext, useCallback, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext({});
const USER_CACHE_KEY = 'ahadu_cached_user';
const readCachedUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_CACHE_KEY) || 'null'); }
  catch { return null; }
};
const cacheUser = (user) => {
  if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_CACHE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readCachedUser());
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
      cacheUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        cacheUser(null);
        setUser(null);
      } else {
        // Keep the existing session/profile during temporary network outages.
        setUser(readCachedUser());
      }
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
    cacheUser(response.data.user);
    return response.data;
  }, []);

  const registerAccount = useCallback(async (formData) => {
    const response = await api.post('/auth/register', formData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const previousLanguage = localStorage.getItem('language') || 'en';
    const requestedLanguage = profileData?.language;
    if (requestedLanguage === 'en' || requestedLanguage === 'am') {
      localStorage.setItem('language', requestedLanguage);
      setUser((current) => current ? {
        ...current,
        preferences: { ...current.preferences, language: requestedLanguage },
      } : current);
    }
    try {
      const response = await api.patch('/auth/me', profileData);
      setUser(response.data.user);
      cacheUser(response.data.user);
      const savedLanguage = response.data.user?.preferences?.language;
      if (savedLanguage) localStorage.setItem('language', savedLanguage);
      return response.data;
    } catch (error) {
      if (requestedLanguage === 'en' || requestedLanguage === 'am') {
        localStorage.setItem('language', previousLanguage);
        setUser((current) => current ? {
          ...current,
          preferences: { ...current.preferences, language: previousLanguage },
        } : current);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    cacheUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        language: user?.preferences?.language || localStorage.getItem('language') || 'en',
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
