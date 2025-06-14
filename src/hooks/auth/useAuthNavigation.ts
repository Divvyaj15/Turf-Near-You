
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // Check if user has a profile and redirect accordingly
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user && userRole) {
        console.log('User authenticated, checking profile...');
        
        try {
          if (userRole === 'turf_owner') {
            navigate('/owner-dashboard');
            return;
          }

          // For customers, check if they have verified their phone
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('phone_verified')
            .eq('id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking profile:', error);
            return;
          }

          if (profile?.phone_verified) {
            // Phone verified, check if they have completed profile setup
            const { data: fullProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('Error checking full profile:', profileError);
              return;
            }

            // If they have basic info, go to find players, otherwise profile setup
            if (fullProfile.age && fullProfile.location) {
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

    if (user && userRole) {
      checkUserProfile();
    }
  }, [user, userRole, navigate]);

  return {
    navigate
  };
};
