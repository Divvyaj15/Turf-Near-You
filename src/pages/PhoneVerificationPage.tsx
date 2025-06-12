
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PhoneVerification from '@/components/PhoneVerification';
import { useToast } from '@/hooks/use-toast';

const PhoneVerificationPage = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive"
        });
        return;
      }

      if (profile) {
        setUserProfile(profile);
        // If phone is already verified, redirect appropriately
        if (profile.phone_verified) {
          if (userRole === 'turf_owner') {
            navigate('/owner-dashboard');
          } else {
            navigate('/find-players');
          }
        }
      } else {
        // No profile found, redirect to profile setup
        navigate('/player-profile-setup');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    if (userRole === 'turf_owner') {
      navigate('/owner-dashboard');
    } else {
      navigate('/player-profile-setup');
    }
  };

  const handleSkip = () => {
    if (userRole === 'turf_owner') {
      navigate('/owner-dashboard');
    } else {
      navigate('/player-profile-setup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center">
        <div className="text-white text-lg">Profile not found. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
      <PhoneVerification
        userId={user!.id}
        phoneNumber={userProfile.phone_number}
        onVerificationComplete={handleVerificationComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default PhoneVerificationPage;
