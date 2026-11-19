import { createContext, useCallback, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext({});

const CACHED_PROFILE_KEY = 'ahadu_cached_profile';
function readCachedProfile() {
  try {
    const value = localStorage.getItem(CACHED_PROFILE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
function cacheProfile(profile) {
  try {
    if (profile) localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(CACHED_PROFILE_KEY);
  } catch {
    // Best-effort only; authentication must not depend on profile caching.
  }
}

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
      cacheProfile(response.data.user);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('token');
        cacheProfile(null);
        setUser(null);
      } else {
        // Preserve offline navigation; protected API operations still require server authorization.
        setUser(readCachedProfile());
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
    cacheProfile(response.data.user);
    return response.data;
  }, []);

  const registerAccount = useCallback(async (formData) => {
    const response = await api.post('/auth/register', formData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    cacheProfile(response.data.user);
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
      cacheProfile(response.data.user);
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
    cacheProfile(null);
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
