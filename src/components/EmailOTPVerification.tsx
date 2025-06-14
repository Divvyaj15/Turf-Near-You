
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmailOTPVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBackToAuth: () => void;
}

const EmailOTPVerification: React.FC<EmailOTPVerificationProps> = ({
  email,
  onVerificationComplete,
  onBackToAuth
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Verified! 🎉",
          description: "Your email has been successfully verified.",
        });
        
        // Redirect to phone verification
        navigate('/phone-verification');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        toast({
          title: "Failed to Resend",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email",
        });
        setCountdown(60);
        setCanResend(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 cricket-gradient rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary">Verify Email</span>
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <p className="text-muted-foreground">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-primary">{email}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <label className="text-sm font-medium">Enter verification code</label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        <Button 
          onClick={handleVerifyOTP}
          className="w-full cricket-gradient text-white hover:opacity-90" 
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          {canResend ? (
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={isResending}
              className="p-0 h-auto text-primary"
            >
              {isResending ? 'Resending...' : 'Resend verification code'}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Resend in {countdown}s
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          onClick={onBackToAuth}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign Up
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailOTPVerification;
