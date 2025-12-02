"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Ideally we should have a /me endpoint to get current user details
      // For now, we'll rely on the stored user data or decode token if needed
      // But since we don't have a /me endpoint yet, let's assume if we have a token we are logged in
      // and we might need to store user info in local storage as well for persistence
      // or fetch it.
      
      // Let's try to fetch user profile if possible, or just set loading false
      // Assuming we store user in localStorage for now as a simple solution
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check failed', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
