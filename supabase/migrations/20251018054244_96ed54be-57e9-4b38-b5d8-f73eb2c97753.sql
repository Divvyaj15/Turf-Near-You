-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own complete profile (including email & phone)
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow authenticated users to view other profiles
-- Applications should use public_profiles view to exclude sensitive data
CREATE POLICY "Authenticated users can view other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() != id);

-- Create a secure view for public profile information (without sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated, anon;