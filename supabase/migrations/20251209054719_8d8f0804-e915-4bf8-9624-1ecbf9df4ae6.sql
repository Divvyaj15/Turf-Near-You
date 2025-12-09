-- Allow authenticated users to claim unclaimed turfs (where owner_id is null)
CREATE POLICY "Users can claim unclaimed turfs"
ON public.turfs
FOR UPDATE
USING (owner_id IS NULL)
WITH CHECK (owner_id = auth.uid());