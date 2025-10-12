-- Add additional columns to profiles for player features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cricheroes_verified BOOLEAN DEFAULT false;

-- Create user_sports_profiles table for sport-specific player information
CREATE TABLE IF NOT EXISTS public.user_sports_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sport TEXT NOT NULL,
  skill_level INTEGER DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
  preferred_positions TEXT[],
  batting_style TEXT,
  bowling_style TEXT,
  playing_foot TEXT,
  experience_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, sport)
);

-- Enable RLS on user_sports_profiles
ALTER TABLE public.user_sports_profiles ENABLE ROW LEVEL SECURITY;

-- User sports profiles RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sports_profiles' AND policyname = 'User sports profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "User sports profiles are viewable by everyone"
      ON public.user_sports_profiles FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sports_profiles' AND policyname = 'Users can manage their own sports profiles'
  ) THEN
    CREATE POLICY "Users can manage their own sports profiles"
      ON public.user_sports_profiles FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create user_availability table for player availability
CREATE TABLE IF NOT EXISTS public.user_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, time_slot)
);

-- Enable RLS on user_availability
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

-- User availability RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_availability' AND policyname = 'User availability is viewable by everyone'
  ) THEN
    CREATE POLICY "User availability is viewable by everyone"
      ON public.user_availability FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_availability' AND policyname = 'Users can manage their own availability'
  ) THEN
    CREATE POLICY "Users can manage their own availability"
      ON public.user_availability FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_user_sports_profiles_updated_at ON public.user_sports_profiles;
CREATE TRIGGER update_user_sports_profiles_updated_at
  BEFORE UPDATE ON public.user_sports_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sports_profiles_user_id ON public.user_sports_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sports_profiles_sport ON public.user_sports_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_user_availability_user_id ON public.user_availability(user_id);