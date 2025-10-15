
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has a profile and redirect accordingly
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        console.log('User authenticated, checking profile...');
        
        try {
          // Check if they have verified their phone
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('phone_verified, age, location')
            .eq('id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking profile:', error);
            return;
          }

          if (profile?.phone_verified) {
            // If they have basic info, go to find players, otherwise profile setup
            if (profile.age && profile.location) {
              navigate('/find-players');
            } else {
              navigate('/player-profile-setup');
            }
          } else {
            // Phone not verified, redirect to verification
            navigate('/phone-verification');
          }
        } catch (error) {
          console.error('Error in profile check:', error);
        }
      }
    };

    if (user) {
      checkUserProfile();
    }
  }, [user, navigate]);

  return {
    navigate
  };
};
