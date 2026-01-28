-- Fix RLS Policy for Admin Impersonation
-- This allows admins to update any restaurant profile when impersonating
-- Run this in the Supabase SQL Editor

-- First, let's check the current policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Create new UPDATE policy that allows:
-- 1. Users to update their own profile
-- 2. Service role to update any profile (for admin impersonation)
CREATE POLICY "Allow profile updates for owners and service role"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id  -- User can update their own profile
  OR 
  auth.jwt() ->> 'role' = 'service_role'  -- Service role can update any profile
)
WITH CHECK (
  auth.uid() = id 
  OR 
  auth.jwt() ->> 'role' = 'service_role'
);

-- Also ensure INSERT policy allows service role
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

CREATE POLICY "Allow profile inserts for authenticated and service role"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id
  OR
  auth.jwt() ->> 'role' = 'service_role'
);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
