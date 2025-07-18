-- Add policy for admins to view all turf owners
CREATE POLICY "Admins can view all turf owners" 
ON public.turf_owners 
FOR SELECT 
USING (public.is_admin());

-- Add policy for admins to view all turfs
CREATE POLICY "Admins can view all turfs" 
ON public.turfs 
FOR SELECT 
USING (public.is_admin());