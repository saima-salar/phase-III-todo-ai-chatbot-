// frontend/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '../../lib/better-auth-client';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Better Auth session
    const initializeAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.user) {
          // Map Better Auth user to our User interface
          const mappedUser: User = {
            id: parseInt(session.user.id),
            email: session.user.email,
            first_name: session.user.firstName,
            last_name: session.user.lastName,
            created_at: session.user.createdAt,
            updated_at: session.user.updatedAt
          };
          setUser(mappedUser);
          setToken(session.token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/" // Redirect after login
      });

      if (result?.session) {
        // Map Better Auth user to our User interface
        const mappedUser: User = {
          id: parseInt(result.session.user.id),
          email: result.session.user.email,
          first_name: result.session.user.firstName,
          last_name: result.session.user.lastName,
          created_at: result.session.user.createdAt,
          updated_at: result.session.user.updatedAt
        };
        setUser(mappedUser);
        setToken(result.session.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        firstName,
        lastName,
        callbackURL: "/" // Redirect after registration
      });

      if (result?.session) {
        // Map Better Auth user to our User interface
        const mappedUser: User = {
          id: parseInt(result.session.user.id),
          email: result.session.user.email,
          first_name: result.session.user.firstName,
          last_name: result.session.user.lastName,
          created_at: result.session.user.createdAt,
          updated_at: result.session.user.updatedAt
        };
        setUser(mappedUser);
        setToken(result.session.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated }}>
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