-- Enable RLS on the table (if not already enabled)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Allow users to delete their own generations
CREATE POLICY "Users can delete their own generations"
ON generations FOR DELETE
USING (auth.uid() = user_id);

-- Ensure users can also select their own generations (likely already exists, but good for completeness in debugging)
-- CREATE POLICY "Users can view their own generations"
-- ON generations FOR SELECT
-- USING (auth.uid() = user_id);
