import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';

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
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (username: string, password: string, email?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if username already exists
      const existingUser = StorageService.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password
      const { hash: passwordHash } = await EncryptionService.hashPassword(password);

      // Create new user
      const newUser: User = {
        id: StorageService.generateId(),
        username,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      // Save user
      StorageService.saveUser(newUser);
      StorageService.setCurrentUser(newUser);
      setUser(newUser);

      return true;
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

      // Find user
      const existingUser = StorageService.getUserByUsername(username);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Extract salt from stored password hash
      const storedHash = existingUser.passwordHash;
      const salt = storedHash.slice(-32); // Last 32 chars are salt
      const hash = storedHash.slice(0, -32); // First part is hash

      // Verify password
      const isValid = await EncryptionService.verifyPassword(password, hash, salt);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Set current user
      StorageService.setCurrentUser(existingUser);
      setUser(existingUser);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    StorageService.clearCurrentUser();
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