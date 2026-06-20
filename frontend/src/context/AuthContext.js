import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token        = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!token && !refreshToken) {
          setLoading(false);
          return;
        }

        try {
          const { data } = await api.get('/user/profile');
          setUser(data.data || data);
        } catch (err) {
          if (refreshToken) {
            try {
              const { data } = await api.post('/auth/refresh', { refreshToken });
              await SecureStore.setItemAsync('accessToken',  data.data.accessToken);
              await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
              setUser(data.data.user);
            } catch {
              await clearTokens();
            }
          } else {
            await clearTokens();
          }
        }
      } catch {
        await clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearTokens = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('accessToken',  data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    await SecureStore.setItemAsync('accessToken',  data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    await clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
