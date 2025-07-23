-- Create turf_slots table for managing time slots
CREATE TABLE public.turf_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turf_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60)),
  price_per_slot NUMERIC NOT NULL CHECK (price_per_slot > 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turf_id, day_of_week, start_time)
);

-- Enable RLS on turf_slots
ALTER TABLE public.turf_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for turf_slots
CREATE POLICY "Everyone can view available turf slots" 
ON public.turf_slots 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Owners can manage their turf slots" 
ON public.turf_slots 
FOR ALL 
USING (turf_id IN (
  SELECT t.id 
  FROM turfs t 
  JOIN turf_owners owner ON t.owner_id = owner.id 
  WHERE owner.user_id = auth.uid()
));

-- Update bookings table to support slot-based booking
ALTER TABLE public.bookings 
ADD COLUMN slot_id UUID,
ADD COLUMN duration_minutes INTEGER CHECK (duration_minutes IN (30, 60)),
ADD COLUMN slot_price NUMERIC;

-- Create policies for slot-based bookings
CREATE POLICY "Users can create slot bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  (slot_id IS NULL OR slot_id IN (
    SELECT id FROM turf_slots WHERE is_available = true
  ))
);

-- Create trigger to update turf_slots updated_at
CREATE OR REPLACE FUNCTION public.update_turf_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_turf_slots_updated_at
BEFORE UPDATE ON public.turf_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_turf_slots_updated_at();