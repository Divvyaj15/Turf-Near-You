-- Update the specific user to have admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'divvyavidhyutjain601@gmail.com';

-- Also create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;