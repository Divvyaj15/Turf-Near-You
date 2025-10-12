
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Shield, RefreshCw } from 'lucide-react';

interface PhoneVerificationProps {
  userId: string;
  phoneNumber: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  phoneNumber,
  onVerificationComplete,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Start countdown timer
  const startCountdown = () => {
    setTimeLeft(300); // 5 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendVerificationCode = async () => {
    setIsLoading(true);
    
    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log('Generated OTP:', code);
      
      // In production, integrate with an SMS service like Twilio
      // For now, just show the code in console and toast
      console.log('OTP Code:', code);
      
      // Mark that we sent the code (in production, you'd store this in DB)
      if (false) { // Placeholder check
        toast({
          title: "Error",
          description: "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setCodeSent(true);
      startCountdown();
      
      // In production, you would send this via SMS service
      // For demo purposes, show it in a toast and console
      toast({
        title: "OTP Sent Successfully! 📱",
        description: `Demo mode: Your OTP is ${code}. Check console for details.`,
        duration: 10000
      });

      console.log(`=== OTP VERIFICATION ===`);
      console.log(`Phone: ${phoneNumber}`);
      console.log(`OTP Code: ${code}`);
      console.log(`Valid for: 5 minutes`);
      console.log(`=======================`);
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsResending(true);
    setVerificationCode('');
    await sendVerificationCode();
    setIsResending(false);
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a complete 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // For demo, just accept the code (in production, verify against stored code)
      if (verificationCode.length !== 6) {
        toast({
          title: "Invalid OTP ❌",
          description: "Please enter a valid 6-digit code.",
          variant: "destructive"
        });
        return;
      }

      // Mark phone as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          is_available: true // Enable availability once verified
        })
        .eq('id', userId);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to complete verification. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Phone Verified Successfully! ✅",
        description: "Your phone number has been verified. You can now find players!",
      });

      onVerificationComplete();
      
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 cricket-gradient rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl">Verify Phone Number</CardTitle>
        <p className="text-muted-foreground">
          Enter the OTP sent to your phone to complete verification
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-muted rounded-lg">
          <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">{phoneNumber}</p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll send a 6-digit OTP to this number
          </p>
        </div>

        {!codeSent ? (
          <div className="space-y-4">
            <Button 
              onClick={sendVerificationCode}
              disabled={isLoading}
              className="w-full cricket-gradient text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full"
            >
              Back to Sign Up
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter 6-Digit OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  value={verificationCode}
                  onChange={setVerificationCode}
                  maxLength={6}
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
              {timeLeft > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  OTP expires in: <span className="font-mono">{formatTime(timeLeft)}</span>
                </p>
              )}
            </div>

            <Button 
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full cricket-gradient text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={resendCode}
                disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
                className="flex-1"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>Didn't receive the OTP? Check console for demo code</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
