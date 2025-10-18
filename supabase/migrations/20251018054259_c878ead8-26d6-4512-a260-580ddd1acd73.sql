-- Recreate the view with SECURITY INVOKER to use querying user's permissions
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT
  id,
  full_name,
  bio,
  location,
  avatar_url,
  profile_image_url,
  gender,
  age,
  is_available,
  overall_rating,
  total_games_played,
  phone_verified,
  cricheroes_verified,
  created_at,
  updated_at
FROM public.profiles;

-- Ensure proper grants
GRANT SELECT ON public.public_profiles TO authenticated, anon;