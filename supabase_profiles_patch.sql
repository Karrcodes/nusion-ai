-- Add branding columns to the profiles table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS cuisine_type text,
ADD COLUMN IF NOT EXISTS accent_color text,
ADD COLUMN IF NOT EXISTS font text,
ADD COLUMN IF NOT EXISTS ui_style text;

-- Optional: Add a comment to describe the columns
COMMENT ON COLUMN public.profiles.cover_url IS 'URL for the restaurant card cover image used on landing/discovery pages.';
COMMENT ON COLUMN public.profiles.logo_url IS 'URL for the restaurant brand logo.';
COMMENT ON COLUMN public.profiles.cuisine_type IS 'Primary cuisine categories (e.g. Modern West African).';
