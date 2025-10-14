-- Grant admin role to the specified email
-- This will be executed when the user with this email signs up or already exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'divvyavidhyutjian601@gmail.com';
  
  -- If user exists, insert admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Create a function to check if turf needs approval
CREATE OR REPLACE FUNCTION public.check_turf_approval_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set turf as pending approval when created
  NEW.is_approved := false;
  NEW.is_active := false;
  RETURN NEW;
END;
$$;

-- Create trigger for new turfs
DROP TRIGGER IF EXISTS set_turf_pending_on_insert ON public.turfs;
CREATE TRIGGER set_turf_pending_on_insert
  BEFORE INSERT ON public.turfs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_turf_approval_status();