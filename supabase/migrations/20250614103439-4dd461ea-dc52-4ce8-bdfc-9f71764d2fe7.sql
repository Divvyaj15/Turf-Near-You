
-- Delete all existing users and related data in correct order to avoid foreign key violations
DELETE FROM public.user_sports_profiles;
DELETE FROM public.user_availability;
DELETE FROM public.player_reviews;
DELETE FROM public.game_invitations;
DELETE FROM public.games;
DELETE FROM public.reviews;
DELETE FROM public.bookings;
DELETE FROM public.user_profiles;
DELETE FROM public.profiles;

-- Now delete users from auth.users (this should work now that all references are gone)
DELETE FROM auth.users;

-- Make phone_number required in user_profiles table
ALTER TABLE user_profiles 
ALTER COLUMN phone_number SET NOT NULL;

-- Make phone_verified required to be true for active users
-- Add a check constraint to ensure phone is verified for active users
ALTER TABLE user_profiles 
ADD CONSTRAINT phone_verified_required 
CHECK (phone_verified = true OR is_available = false);

-- Update the handle_new_user function to require phone verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Insert into profiles table (existing functionality)
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  );
  
  -- Insert into user_profiles table for player discovery (only for customers)
  IF COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer') = 'customer' THEN
    INSERT INTO public.user_profiles (
      id, 
      full_name, 
      phone_number, 
      phone_verified,
      is_available,
      overall_rating,
      total_games_played
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
      false,
      false, -- Set to false until phone is verified
      0.0,
      0
    );
  END IF;
  
  RETURN NEW;
END;
$$;
