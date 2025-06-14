
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PhoneVerification from '@/components/PhoneVerification';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PhoneVerificationPage = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        if (userRole === 'turf_owner') {
          // Turf owners don't need phone verification for player discovery
          navigate('/owner-dashboard');
          return;
        }

        // Check if user already has verified phone
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('phone_number, phone_verified')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          navigate('/auth');
          return;
        }

        if (profile?.phone_verified) {
          // Already verified, redirect to find players
          navigate('/find-players');
          return;
        }

        setPhoneNumber(profile?.phone_number || '');
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        navigate('/auth');
      }
    };

    checkVerificationStatus();
  }, [user, userRole, navigate]);

  const handleVerificationComplete = () => {
    navigate('/find-players');
  };

  const handleBack = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <PhoneVerification
          userId={user?.id || ''}
          phoneNumber={phoneNumber}
          onVerificationComplete={handleVerificationComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
