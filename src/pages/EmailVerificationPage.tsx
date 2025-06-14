
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmailOTPVerification from '@/components/EmailOTPVerification';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleVerificationComplete = () => {
    // After email verification, redirect to phone verification
    navigate('/phone-verification');
  };

  const handleBackToAuth = () => {
    navigate('/auth?mode=register');
  };

  if (!email) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmailOTPVerification
          email={email}
          onVerificationComplete={handleVerificationComplete}
          onBackToAuth={handleBackToAuth}
        />
      </div>
    </div>
  );
};

export default EmailVerificationPage;
