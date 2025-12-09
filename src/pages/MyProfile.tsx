import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, MapPin, Phone, Calendar, Edit } from 'lucide-react';
import { TurfClaimSection } from '@/components/TurfClaimSection';
import { ProfileEditForm } from '@/components/ProfileEditForm';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  is_available: boolean | null;
}

export default function MyProfile() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasOwnedTurfs, setHasOwnedTurfs] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfile();
    checkOwnedTurfs();
  }, [user, navigate]);

  const checkOwnedTurfs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setHasOwnedTurfs(true);
      }
    } catch (error) {
      console.error('Error checking owned turfs:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: !profile.is_available })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, is_available: !profile.is_available });
      toast({
        title: "Success",
        description: `You are now ${!profile.is_available ? 'available' : 'unavailable'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No profile found</p>
            <Button onClick={() => navigate('/player-profile-setup')}>
              Complete Profile Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="space-y-6">
        <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              {profile.is_available !== null && (
                <Button onClick={toggleAvailability} variant="outline" size="sm">
                  {profile.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <ProfileEditForm
              profile={profile}
              onSuccess={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>

          {profile.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{profile.phone_number}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.age && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{profile.age} years old</span>
            </div>
          )}

          {profile.gender && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{profile.gender}</span>
            </div>
          )}

          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {userRole && (
            <div>
              <Badge variant="secondary">{userRole}</Badge>
            </div>
          )}
          </>
          )}
        </CardContent>
      </Card>

      {!hasOwnedTurfs && (
        <TurfClaimSection 
          userId={user?.id || ''} 
          hasOwnerRole={userRole === 'owner'}
          onTurfClaimed={() => setHasOwnedTurfs(true)}
        />
      )}
      </div>
    </div>
  );
}
