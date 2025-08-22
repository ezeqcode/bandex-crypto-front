import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest } from '@/types';
import { authApi } from '@/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          sessionStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      const { access_token, user: userData } = response;
      
      sessionStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    // Verifica se as permissões estão no user diretamente ou no role
    const userPermissions = user?.permissions || (typeof user?.role === 'object' ? user.role.permissions : []);
    const hasAccess = userPermissions?.includes(permission) || false;
    console.log(`Checking permission: ${permission}, User permissions:`, userPermissions, 'Has access:', hasAccess);
    return hasAccess;
  };

  const hasRole = (role: string): boolean => {
    const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
    return userRole === role || false;
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};