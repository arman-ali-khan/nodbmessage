/*
  # Fix messages table permissions for anonymous role

  1. Security Changes
    - Grant explicit SELECT permission to anonymous role for messages table
    - This fixes the "Could not find the table 'public.messages' in the schema cache" error

  2. Notes
    - The anonymous role needs explicit permissions to access table schema through Supabase API
    - This resolves the 404 error when fetching messages
*/

-- Grant explicit permissions to anonymous role for API access
GRANT SELECT ON public.messages TO anon;
GRANT INSERT ON public.messages TO anon;
GRANT UPDATE ON public.messages TO anon;
GRANT DELETE ON public.messages TO anon;