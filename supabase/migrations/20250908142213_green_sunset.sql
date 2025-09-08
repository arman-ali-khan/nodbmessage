/*
  # Create users and chat rooms tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, nullable)
      - `password_hash` (text)
      - `created_at` (timestamp)
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_by` (uuid, foreign key to users)
      - `max_participants` (integer)
      - `invite_code` (text, unique)
      - `created_at` (timestamp)
    - `room_participants`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to chat_rooms)
      - `user_id` (uuid, foreign key to users)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for room access based on participation
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_participants integer DEFAULT 10 CHECK (max_participants > 0 AND max_participants <= 50),
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create room_participants table for many-to-many relationship
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Chat rooms policies
CREATE POLICY "Users can read rooms they participate in"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM room_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update their rooms"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Room participants policies
CREATE POLICY "Users can read room participants for rooms they're in"
  ON room_participants
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM room_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON room_participants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_invite_code ON chat_rooms(invite_code);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);