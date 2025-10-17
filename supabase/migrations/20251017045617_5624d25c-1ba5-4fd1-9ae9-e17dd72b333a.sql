-- Make owner_id nullable to allow unclaimed turfs
ALTER TABLE turfs ALTER COLUMN owner_id DROP NOT NULL;

-- Add a unique constraint to ensure turf_id (id) is unique for claiming
-- (already has PRIMARY KEY so this is already enforced)