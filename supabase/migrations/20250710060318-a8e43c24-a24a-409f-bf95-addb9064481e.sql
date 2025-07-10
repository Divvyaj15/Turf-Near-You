
-- Add the missing phone_number column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN phone_number TEXT;

-- Make phone_number unique since it's used for user identification
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_phone_number_unique UNIQUE (phone_number);

-- Update the constraint to work with nullable phone_number during setup
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS phone_verified_required;

-- Add a more flexible constraint that allows phone_number to be null during initial setup
ALTER TABLE user_profiles 
ADD CONSTRAINT phone_verified_for_availability 
CHECK (
  (phone_number IS NOT NULL AND phone_verified = true AND is_available = true) OR 
  (is_available = false) OR 
  (phone_number IS NULL)
);
