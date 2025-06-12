
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Clock, CheckCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface PhoneVerificationProps {
  userId: string;
  phoneNumber: string;
  onVerificationComplete: () => void;
  onSkip?: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  phoneNumber,
  onVerificationComplete,
  onSkip
}) => {
  const [step, setStep] = useState<'send' | 'verify' | 'verified'>('send');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const sendVerificationCode = async () => {
    setIsLoading(true);
    try {
      // Generate verification code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_verification_code');

      if (codeError) throw codeError;

      // Store verification code in database
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          phone_verification_code: codeData,
          phone_verification_expires_at: expiresAt.toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // In a real app, you would send SMS here
      // For demo purposes, we'll show the code in a toast
      toast({
        title: "Verification Code Sent",
        description: `Your verification code is: ${codeData} (Demo mode - normally sent via SMS)`,
        duration: 10000,
      });

      setStep('verify');
      setTimeLeft(600); // 10 minutes
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check verification code
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('phone_verification_code, phone_verification_expires_at')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const now = new Date();
      const expiresAt = new Date(profile.phone_verification_expires_at);

      if (now > expiresAt) {
        toast({
          title: "Code Expired",
          description: "The verification code has expired. Please request a new one.",
          variant: "destructive"
        });
        setStep('send');
        return;
      }

      if (profile.phone_verification_code !== verificationCode) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Mark phone as verified
      const { error: verifyError } = await supabase
        .from('user_profiles')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expires_at: null
        })
        .eq('id', userId);

      if (verifyError) throw verifyError;

      setStep('verified');
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified.",
      });

      setTimeout(() => {
        onVerificationComplete();
      }, 2000);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          {step === 'verified' ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <Phone className="w-12 h-12 text-primary" />
          )}
        </div>
        <CardTitle>
          {step === 'send' && 'Verify Your Phone Number'}
          {step === 'verify' && 'Enter Verification Code'}
          {step === 'verified' && 'Phone Verified!'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'send' && (
          <>
            <div className="text-center text-gray-600">
              <p>We'll send a verification code to:</p>
              <p className="font-semibold text-lg">{phoneNumber}</p>
            </div>
            <Button 
              onClick={sendVerificationCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            {onSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip}
                className="w-full"
              >
                Skip for Now
              </Button>
            )}
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="text-center text-gray-600">
              <p>Enter the 6-digit code sent to:</p>
              <p className="font-semibold">{phoneNumber}</p>
              {timeLeft > 0 && (
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Code expires in {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
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
              onClick={verifyCode} 
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setStep('send')}
              className="w-full"
            >
              Send New Code
            </Button>
          </>
        )}

        {step === 'verified' && (
          <div className="text-center">
            <p className="text-green-600 font-semibold">
              Your phone number has been successfully verified!
            </p>
            <p className="text-gray-600 mt-2">
              Redirecting you to the app...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
