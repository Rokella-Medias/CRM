import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, role: string, email: string, password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and subscribe to Auth changes from Supabase
  useEffect(() => {
    // 1. Check current session active state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Default User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Sales Agent'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error('Error getting Supabase session:', err);
      setIsLoading(false);
    });

    // 2. Listen for auth changes dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Default User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Sales Agent'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login handler
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase Login error:', error.message);
      setIsLoading(false);
      return false;
    }

    if (data?.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name || 'Default User',
        email: data.user.email || '',
        role: data.user.user_metadata?.role || 'Sales Agent'
      });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  // Signup handler
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) {
      console.error('Supabase Signup error:', error.message);
      setIsLoading(false);
      return false;
    }

    if (data?.user) {
      // If user session is returned (auto sign-in on signup is enabled by default in Supabase)
      if (data.session) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || name,
          email: data.user.email || email,
          role: data.user.user_metadata?.role || role
        });
      }
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase Logout error:', error.message);
    }
    setUser(null);
    setIsLoading(false);
  };

  // Update profile details
  const updateProfile = async (
    name: string,
    role: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);

    const updateParams: {
      email?: string;
      password?: string;
      data: {
        name: string;
        role: string;
      };
    } = {
      data: { name, role }
    };

    // Only update email/password if they changed
    if (email !== user.email) {
      updateParams.email = email;
    }
    if (password) {
      updateParams.password = password;
    }

    const { data, error } = await supabase.auth.updateUser(updateParams);

    if (error) {
      console.error('Supabase Update Profile error:', error.message);
      setIsLoading(false);
      return false;
    }

    if (data?.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name || name,
        email: data.user.email || email,
        role: data.user.user_metadata?.role || role
      });
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
