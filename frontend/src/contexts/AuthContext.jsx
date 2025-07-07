import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuthStatus } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await checkAuthStatus();
      if (data.isLoggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check auth status', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };
  
  const value = { user, login, logout, isLoading, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};