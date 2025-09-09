/*
  # Fix schema permissions for messages table access

  1. Schema Permissions
    - Grant USAGE on public schema to public role
    - Grant USAGE on public schema to anon role
    - Ensure proper schema cache discovery

  2. Notes
    - This fixes the "Could not find the table 'public.messages' in the schema cache" error
    - Allows Supabase API to properly discover the messages table
*/

-- Grant schema usage permissions to ensure proper schema cache discovery
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon;

-- Ensure the messages table permissions are properly set
GRANT ALL ON public.messages TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon;