import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

/**
 * Wraps the app and provides user auth state to all children.
 * Use `useAuth()` in any component to access user, login, signup, logout.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = async (u) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', u.id)
        .single();
      if (!error && data) setIsAdmin(data.role === 'admin');
    } catch(err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Load user on mount
    authService.getCurrentUser().then((u) => {
      setUser(u);
      checkRole(u).then(() => setLoading(false));
    });

    // Keep in sync with Supabase auth state
    const unsubscribe = authService.onAuthStateChange((_event, session) => {
      const currentU = session?.user ?? null;
      setUser(currentU);
      checkRole(currentU);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) setUser(result.user);
    return result;
  };

  const signup = async (email, password, fullName) => {
    const result = await authService.signup(email, password, fullName);
    if (result.success && !result.confirmationRequired) setUser(result.user);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
