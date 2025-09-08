import { supabase } from '../lib/supabase';
import { EncryptionService } from '../utils/encryption';
import { User } from '../types';

export class AuthService {
  static async register(username: string, password: string, email?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Username already exists' };
      }

      // Hash password
      const { hash: passwordHash } = await EncryptionService.hashPassword(password);

      // Create user in database
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          username,
          email: email || null,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Failed to create account' };
      }

      const user: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: newUser.password_hash,
        createdAt: newUser.created_at,
      };

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Find user by username
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error || !userData) {
        return { success: false, error: 'User not found' };
      }

      // Extract salt from stored password hash
      const storedHash = userData.password_hash;
      const salt = storedHash.slice(-32); // Last 32 chars are salt
      const hash = storedHash.slice(0, -32); // First part is hash

      // Verify password
      const isValid = await EncryptionService.verifyPassword(password, hash, salt);
      if (!isValid) {
        return { success: false, error: 'Invalid password' };
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        passwordHash: userData.password_hash,
        createdAt: userData.created_at,
      };

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        passwordHash: data.password_hash,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}