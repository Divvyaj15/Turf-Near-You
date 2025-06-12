
-- Add phone verification fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verification_code TEXT,
ADD COLUMN phone_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Add RLS policies for phone verification
CREATE POLICY "Users can update their own phone verification" ON user_profiles 
FOR UPDATE USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Create function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code() 
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to create user_profiles entry
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
  
  -- Insert into user_profiles table for player discovery
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
      true,
      0.0,
      0
    );
  END IF;
  
  RETURN NEW;
END;
$$;
