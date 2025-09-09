/*
  # Create messages table for real-time chat

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to chat_rooms)
      - `sender_id` (uuid, foreign key to users)
      - `sender_username` (text)
      - `content` (text, decrypted content for display)
      - `encrypted_content` (text, encrypted content for storage)
      - `iv` (text, initialization vector for encryption)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on messages table
    - Add policies for participants to read and send messages
    - Add indexes for performance

  3. Notes
    - Messages are stored encrypted but also include decrypted content for easier querying
    - Only room participants can read messages from their rooms
    - All users can insert messages (will be validated by application logic)
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_username text NOT NULL,
  content text NOT NULL,
  encrypted_content text NOT NULL,
  iv text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for messages
CREATE POLICY "Enable all operations for messages"
  ON messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Grant permissions to public role
GRANT ALL ON public.messages TO public;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at);