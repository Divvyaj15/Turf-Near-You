import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Calendar, Star, Trophy, Users } from 'lucide-react';

interface UserProfile {
  full_name: string;
  phone_number: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  max_travel_distance: number | null;
  whatsapp_number: string | null;
  preferred_contact: string | null;
  is_available: boolean | null;
  total_games_played: number | null;
  overall_rating: number | null;
}

interface SportProfile {
  sport: string;
  skill_level: number;
  experience_level: string;
  preferred_positions: string[];
  batting_style?: string;
  bowling_style?: string;
  playing_foot?: string;
  is_active: boolean;
}

const MyProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sportsProfiles, setSportsProfiles] = useState<SportProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profile) {
        // If no profile exists, redirect to setup
        navigate('/player-profile-setup');
        return;
      }

      setUserProfile(profile);

      // Fetch sports profiles
      const { data: sports, error: sportsError } = await supabase
        .from('user_sports_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (sportsError) {
        throw sportsError;
      }

      setSportsProfiles(sports || []);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const getSkillLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Professional';
      default: return 'Unknown';
    }
  };

  const toggleAvailability = async () => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_available: !userProfile.is_available })
        .eq('id', user?.id);

      if (error) throw error;

      setUserProfile({ ...userProfile, is_available: !userProfile.is_available });
      
      toast({
        title: "Status Updated",
        description: `You are now ${!userProfile.is_available ? 'available' : 'unavailable'} for games.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update availability status.",
        variant: "destructive"
      });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-muted-foreground mb-4">
              Complete your player profile to start finding games and players.
            </p>
            <Button onClick={() => navigate('/player-profile-setup')}>
              Complete Profile Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sports Profile</h1>
          <p className="text-muted-foreground">Manage your player profile and sports information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Overview
                </CardTitle>
                <Badge variant={userProfile.is_available ? "default" : "secondary"}>
                  {userProfile.is_available ? "Available" : "Unavailable"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg">{userProfile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p className="text-lg">{userProfile.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-lg capitalize">{userProfile.gender || 'Not specified'}</p>
                  </div>
                  {userProfile.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{userProfile.phone_number}</span>
                    </div>
                  )}
                  {userProfile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  {userProfile.max_travel_distance && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Max Travel Distance</label>
                      <p className="text-lg">{userProfile.max_travel_distance} km</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={toggleAvailability} variant="outline">
                    {userProfile.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                  <Button onClick={() => navigate('/player-profile-setup')}>
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Games Played</span>
                  </div>
                  <span className="font-semibold">{userProfile.total_games_played || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-semibold">{(userProfile.overall_rating || 0).toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userProfile.preferred_contact && (
                  <p className="text-sm">
                    <span className="font-medium">Preferred: </span>
                    <span className="capitalize">{userProfile.preferred_contact}</span>
                  </p>
                )}
                {userProfile.whatsapp_number && (
                  <p className="text-sm">
                    <span className="font-medium">WhatsApp: </span>
                    {userProfile.whatsapp_number}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sports Profiles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sports Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            {sportsProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportsProfiles.map((sport, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold capitalize">{sport.sport}</h4>
                      <Badge variant="outline">{getSkillLevelText(sport.skill_level)}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Experience: </span>
                        <span className="capitalize">{sport.experience_level}</span>
                      </p>
                      
                      {sport.preferred_positions?.length > 0 && (
                        <div>
                          <span className="font-medium">Positions: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sport.preferred_positions.map((position, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {position}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {sport.batting_style && (
                        <p>
                          <span className="font-medium">Batting: </span>
                          {sport.batting_style}
                        </p>
                      )}
                      
                      {sport.bowling_style && (
                        <p>
                          <span className="font-medium">Bowling: </span>
                          {sport.bowling_style}
                        </p>
                      )}
                      
                      {sport.playing_foot && (
                        <p>
                          <span className="font-medium">Playing Foot: </span>
                          {sport.playing_foot}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Sports Profiles</h4>
                <p className="text-muted-foreground mb-4">
                  Add your sports information to find players and games.
                </p>
                <Button onClick={() => navigate('/player-profile-setup')}>
                  Add Sports Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
