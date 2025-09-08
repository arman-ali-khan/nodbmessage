import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = JSON.parse(localStorage.getItem('chat_current_user') || 'null');
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (username: string, password: string, email?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const result = await AuthService.register(username, password, email);
      
      if (result.success && result.user) {
        localStorage.setItem('chat_current_user', JSON.stringify(result.user));
        setUser(result.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const result = await AuthService.login(username, password);
      
      if (result.success && result.user) {
        localStorage.setItem('chat_current_user', JSON.stringify(result.user));
        setUser(result.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('chat_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};