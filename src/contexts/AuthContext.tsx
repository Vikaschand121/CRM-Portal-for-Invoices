import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginCredentials, TwoFactorVerification, LoginResult } from '../types';
import { authService } from '../services/auth.service';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  verify2FA: (verification: TwoFactorVerification) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    requires2FA: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
          });
          localStorage.setItem('user', JSON.stringify(user));
          return;
        }
      } catch (error) {
        // If not Unauthorized error, try to load from cache
        if (!(error instanceof Error) || !error.message.includes('Unauthorized')) {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            try {
              const user = JSON.parse(cachedUser);
              setState({
                user,
                isAuthenticated: true,
                isLoading: false,
                requires2FA: false,
              });
              return;
            } catch (parseError) {
              // Invalid cache, continue to logout
            }
          }
        }
      }
    }

    // No token or failed auth
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
    });
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const response = await authService.login(credentials);

      if (response.requires2FA) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          requires2FA: true,
        });
        return response;
      }

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        requires2FA: false,
      });

      // Persist user data
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (verification: TwoFactorVerification) => {
    try {
      const response = await authService.verify2FA(verification);
      setState((prev) => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        requires2FA: false,
        isLoading: false,
      }));
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      api.setToken(null);
      localStorage.removeItem('user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        requires2FA: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        requires2FA: false,
        isLoading: false,
      }));
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    verify2FA,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
