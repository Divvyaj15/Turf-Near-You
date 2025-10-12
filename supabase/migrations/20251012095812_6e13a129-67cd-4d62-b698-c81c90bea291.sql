-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON public.profiles FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create turfs table
CREATE TABLE IF NOT EXISTS public.turfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  images TEXT[],
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sport_type TEXT,
  size TEXT,
  surface_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on turfs
ALTER TABLE public.turfs ENABLE ROW LEVEL SECURITY;

-- Turfs RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turfs' AND policyname = 'Approved turfs are viewable by everyone'
  ) THEN
    CREATE POLICY "Approved turfs are viewable by everyone"
      ON public.turfs FOR SELECT
      USING (is_approved = true OR auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turfs' AND policyname = 'Owners can insert their own turfs'
  ) THEN
    CREATE POLICY "Owners can insert their own turfs"
      ON public.turfs FOR INSERT
      WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turfs' AND policyname = 'Owners can update their own turfs'
  ) THEN
    CREATE POLICY "Owners can update their own turfs"
      ON public.turfs FOR UPDATE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turfs' AND policyname = 'Owners can delete their own turfs'
  ) THEN
    CREATE POLICY "Owners can delete their own turfs"
      ON public.turfs FOR DELETE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Enable RLS on turf_slots (table already exists)
ALTER TABLE public.turf_slots ENABLE ROW LEVEL SECURITY;

-- Turf slots RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turf_slots' AND policyname = 'Turf slots are viewable by everyone'
  ) THEN
    CREATE POLICY "Turf slots are viewable by everyone"
      ON public.turf_slots FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'turf_slots' AND policyname = 'Turf owners can manage their slots'
  ) THEN
    CREATE POLICY "Turf owners can manage their slots"
      ON public.turf_slots FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.turfs
          WHERE turfs.id = turf_slots.turf_id
            AND turfs.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Enable RLS on bookings (table already exists)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can view their own bookings'
  ) THEN
    CREATE POLICY "Users can view their own bookings"
      ON public.bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Turf owners can view bookings for their turfs'
  ) THEN
    CREATE POLICY "Turf owners can view bookings for their turfs"
      ON public.bookings FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.turfs
          WHERE turfs.id = bookings.turf_id
            AND turfs.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can create their own bookings'
  ) THEN
    CREATE POLICY "Users can create their own bookings"
      ON public.bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can update their own bookings'
  ) THEN
    CREATE POLICY "Users can update their own bookings"
      ON public.bookings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Turf owners can update bookings for their turfs'
  ) THEN
    CREATE POLICY "Turf owners can update bookings for their turfs"
      ON public.bookings FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.turfs
          WHERE turfs.id = bookings.turf_id
            AND turfs.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  turf_id UUID REFERENCES public.turfs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are viewable by everyone'
  ) THEN
    CREATE POLICY "Reviews are viewable by everyone"
      ON public.reviews FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create reviews for their bookings'
  ) THEN
    CREATE POLICY "Users can create reviews for their bookings"
      ON public.reviews FOR INSERT
      WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
          SELECT 1 FROM public.bookings
          WHERE bookings.id = reviews.booking_id
            AND bookings.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can update their own reviews'
  ) THEN
    CREATE POLICY "Users can update their own reviews"
      ON public.reviews FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can delete their own reviews'
  ) THEN
    CREATE POLICY "Users can delete their own reviews"
      ON public.reviews FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_turfs_updated_at ON public.turfs;
CREATE TRIGGER update_turfs_updated_at
  BEFORE UPDATE ON public.turfs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_turf_slots_updated_at ON public.turf_slots;
CREATE TRIGGER update_turf_slots_updated_at
  BEFORE UPDATE ON public.turf_slots
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_turfs_owner_id ON public.turfs(owner_id);
CREATE INDEX IF NOT EXISTS idx_turfs_location ON public.turfs(location);
CREATE INDEX IF NOT EXISTS idx_turfs_is_approved ON public.turfs(is_approved);
CREATE INDEX IF NOT EXISTS idx_turf_slots_turf_id ON public.turf_slots(turf_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_turf_id ON public.bookings(turf_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_turf_id ON public.reviews(turf_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);