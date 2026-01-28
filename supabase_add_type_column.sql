-- Add 'type' column to profiles table
-- Required for filtering between Diners and Restaurants

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'diner';

COMMENT ON COLUMN public.profiles.type IS 'User type: "diner" or "restaurant"';

-- Update existing records if any
-- (Optional: logic to guess type based on other fields ?)
-- For now, default to 'diner' if null, or leave as null until updated.
-- Update nulls to 'diner' just in case?
UPDATE public.profiles SET type = 'diner' WHERE type IS NULL;
