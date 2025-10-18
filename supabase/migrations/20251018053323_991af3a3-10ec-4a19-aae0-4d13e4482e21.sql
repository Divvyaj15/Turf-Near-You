-- Create a secure function to grant owner role
CREATE OR REPLACE FUNCTION public.grant_owner_role_to_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert owner role for the user (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.grant_owner_role_to_user(uuid) TO authenticated;