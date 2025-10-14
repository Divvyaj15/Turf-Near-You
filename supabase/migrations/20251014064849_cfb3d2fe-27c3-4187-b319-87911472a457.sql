-- Add admin role enum value if not exists
DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to automatically grant owner role when turf is created
CREATE OR REPLACE FUNCTION public.grant_owner_role_on_turf_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert owner role for the user if they don't have it
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.owner_id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic owner role assignment
DROP TRIGGER IF EXISTS assign_owner_role_on_turf_create ON public.turfs;
CREATE TRIGGER assign_owner_role_on_turf_create
  AFTER INSERT ON public.turfs
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_owner_role_on_turf_creation();