import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Calendar, Star, Trophy, Users, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';

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

interface TurfOwnerProfile {
  business_name: string;
  owner_name: string;
  business_type: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  years_of_operation: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
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
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<TurfOwnerProfile | null>(null);
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
      if (userRole === 'turf_owner') {
        // Fetch turf owner profile
        const { data: ownerData, error: ownerError } = await supabase
          .from('turf_owners')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (ownerError && ownerError.code !== 'PGRST116') {
          throw ownerError;
        }

        if (!ownerData) {
          // If no owner profile exists, redirect to dashboard for registration
          navigate('/owner-dashboard');
          return;
        }

        setOwnerProfile({
          ...ownerData,
          verification_status: ownerData.verification_status as 'pending' | 'verified' | 'rejected'
        });
      } else {
        // Fetch user profile for customers
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
      }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!userProfile && !ownerProfile) {
    const profileType = userRole === 'turf_owner' ? 'owner' : 'player';
    const setupAction = userRole === 'turf_owner' 
      ? () => navigate('/owner-dashboard')
      : () => navigate('/player-profile-setup');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-muted-foreground mb-4">
              Complete your {profileType} profile to get started.
            </p>
            <Button onClick={setupAction}>
              Complete {profileType === 'owner' ? 'Owner Registration' : 'Profile Setup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Turf Owner Profile View
  if (userRole === 'turf_owner' && ownerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Business Profile</h1>
            <p className="text-muted-foreground">Manage your turf owner profile and business information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Overview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ownerProfile.verification_status)}
                    {getStatusBadge(ownerProfile.verification_status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                      <p className="text-lg font-semibold">{ownerProfile.business_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
                      <p className="text-lg">{ownerProfile.owner_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                      <p className="text-lg capitalize">{ownerProfile.business_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Years of Operation</label>
                      <p className="text-lg">{ownerProfile.years_of_operation || 'Not specified'} year(s)</p>
                    </div>
                    {ownerProfile.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{ownerProfile.contact_phone}</span>
                      </div>
                    )}
                    {ownerProfile.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{ownerProfile.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={() => navigate('/owner-dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ownerProfile.contact_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                      <p className="text-sm">{ownerProfile.contact_email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                    <p className="text-sm">{new Date(ownerProfile.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {ownerProfile.verification_status === 'pending' && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Verification Pending</h4>
                        <p className="text-sm text-yellow-700">
                          Your account is under review. You'll receive an email once approved.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {ownerProfile.verification_status === 'verified' && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Verified Business</h4>
                        <p className="text-sm text-green-700">
                          Your business has been verified. You can now manage turfs and bookings.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
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
