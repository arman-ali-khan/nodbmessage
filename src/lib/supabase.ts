import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          password_hash?: string;
          created_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          max_participants: number;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          max_participants?: number;
          invite_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          max_participants?: number;
          invite_code?: string;
          created_at?: string;
        };
      };
      room_participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          sender_username: string;
          content: string;
          encrypted_content: string;
          iv: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          sender_username: string;
          content: string;
          encrypted_content: string;
          iv: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          sender_username?: string;
          content?: string;
          encrypted_content?: string;
          iv?: string;
          created_at?: string;
        };
      };
    };
  };
}