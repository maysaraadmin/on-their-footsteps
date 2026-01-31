import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AuthService from '../services/authService';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  arabic_name?: string;
  level_id: number;
  total_xp: number;
  preferred_language: 'en' | 'ar';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: { email: string; username: string; password: string; full_name?: string; arabic_name?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<{ success: boolean }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
  authService?: AuthService;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, authService = new AuthService() }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const initializationPromise = useRef(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current || initializationPromise.current) return;
    
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Validate existing session
          const result = await authService.validateSession();
          if (result.success) {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
          } else {
            // Invalid session, clear it
            await authService.logout();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    initializationPromise.current = initializeAuth();
  }, [authService]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [authService]);

  const register = useCallback(async (userData: { email: string; username: string; password: string; full_name?: string; arabic_name?: string }) => {
    setError(null);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [authService]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err: any) {
      // Even if logout API fails, clear local state
      setUser(null);
      setError(null);
      return { success: true };
    }
  }, [authService]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    setError(null);
    try {
      const result = await authService.updateProfile(profileData);
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [authService]);

  const refreshToken = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Token refresh failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [authService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}