import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // Check for token in URL hash from Supabase redirect
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const urlParams = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
          localStorage.setItem('brewfolio_token', accessToken);
          // Clean up the URL hash
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }

      // Restore session
      try {
        const sessionRes = await auth.getSession();
        if (sessionRes?.user) {
          setUser(sessionRes.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('brewfolio_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    handleAuth();
  }, []);

  const login = () => {
    auth.githubLogin();
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
