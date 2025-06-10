
-- Extended user profiles for player discovery
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    location TEXT,
    profile_image_url TEXT,
    cricheroes_username TEXT,
    cricheroes_verified BOOLEAN DEFAULT false,
    overall_rating DECIMAL(2,1) DEFAULT 0.0,
    total_games_played INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    whatsapp_number TEXT,
    preferred_contact TEXT DEFAULT 'whatsapp' CHECK (preferred_contact IN ('call', 'whatsapp', 'in-app')),
    auto_accept_invites BOOLEAN DEFAULT false,
    max_travel_distance INTEGER DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports profiles for each player
CREATE TABLE user_sports_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    sport TEXT NOT NULL CHECK (sport IN ('cricket', 'football', 'pickleball')),
    skill_level INTEGER CHECK (skill_level >= 1 AND skill_level <= 10),
    preferred_positions TEXT[] DEFAULT '{}',
    playing_style JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    batting_style TEXT, -- for cricket
    bowling_style TEXT, -- for cricket
    playing_foot TEXT, -- for football
    experience_level TEXT, -- for pickleball
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, sport)
);

-- User availability schedule
CREATE TABLE user_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, day_of_week, time_slot)
);

-- Games creation and management
CREATE TABLE games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    sport TEXT NOT NULL CHECK (sport IN ('cricket', 'football', 'pickleball')),
    title TEXT NOT NULL,
    description TEXT,
    game_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INTEGER DEFAULT 2,
    location TEXT,
    turf_id UUID REFERENCES turfs(id),
    players_needed INTEGER DEFAULT 10,
    current_players INTEGER DEFAULT 1,
    skill_level_min INTEGER DEFAULT 1,
    skill_level_max INTEGER DEFAULT 10,
    cost_per_player DECIMAL(10,2),
    equipment_available BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    rsvp_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game invitations and responses
CREATE TABLE game_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    invited_user_id UUID REFERENCES auth.users(id) NOT NULL,
    invited_by UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'waitlist')),
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(game_id, invited_user_id)
);

-- Player reviews and ratings
CREATE TABLE player_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES games(id) NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
    reviewed_user_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB DEFAULT '{}', -- skill, punctuality, teamwork, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(game_id, reviewer_id, reviewed_user_id)
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sports_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_sports_profiles
CREATE POLICY "Sports profiles are viewable by everyone" ON user_sports_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own sports profiles" ON user_sports_profiles FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_availability
CREATE POLICY "Availability is viewable by everyone" ON user_availability FOR SELECT USING (true);
CREATE POLICY "Users can manage their own availability" ON user_availability FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for games
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Users can create games" ON games FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own games" ON games FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own games" ON games FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for game_invitations
CREATE POLICY "Users can view invitations they sent or received" ON game_invitations FOR SELECT 
USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
CREATE POLICY "Users can create invitations for their games" ON game_invitations FOR INSERT 
WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "Users can update invitations they received" ON game_invitations FOR UPDATE 
USING (auth.uid() = invited_user_id);

-- RLS Policies for player_reviews
CREATE POLICY "Reviews are viewable by everyone" ON player_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for games they participated in" ON player_reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON player_reviews FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_profiles_available ON user_profiles(is_available);
CREATE INDEX idx_user_sports_profiles_sport ON user_sports_profiles(sport);
CREATE INDEX idx_user_sports_profiles_skill ON user_sports_profiles(skill_level);
CREATE INDEX idx_games_sport_date ON games(sport, game_date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_invitations_user ON game_invitations(invited_user_id);
CREATE INDEX idx_player_reviews_user ON player_reviews(reviewed_user_id);
