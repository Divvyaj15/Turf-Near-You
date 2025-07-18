-- Fix the trigger function to remove the phone column reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles table (existing functionality)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer')
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
$function$;