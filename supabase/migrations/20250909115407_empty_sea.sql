@@ .. @@
-- Grant permissions to public role
GRANT ALL ON public.messages TO public;

+-- Grant explicit permissions to anonymous role for API access
+GRANT SELECT ON public.messages TO anon;
+
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);