-- FIX RLS: Allow users to create their own profile
-- This is required for Google Auth users (who don't go through the signup trigger in some cases)
-- and for the "Self-Healing" logic in the frontend to work.

-- 1. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create INSERT policy (Drop first to avoid errors if exists)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- 3. Create UPDATE policy (Drop first to avoid errors if exists)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Ensure SELECT is allowed (usually public, but good to be safe)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" 
ON profiles FOR SELECT 
USING ( true ); -- Or (auth.uid() = id) for privacy, but 'true' is common for public profiles
