
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Shield } from 'lucide-react';

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
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    setIsLoading(true);
    
    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the verification code in the database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          phone_verification_code: code,
          phone_verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        })
        .eq('id', userId);

      if (error) {
        console.error('Error storing verification code:', error);
        toast({
          title: "Error",
          description: "Failed to send verification code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setCodeSent(true);
      
      // In production, you would send this via SMS
      // For demo purposes, show it in a toast
      toast({
        title: "Verification Code Sent",
        description: `Demo mode: Your verification code is ${code}`,
        duration: 10000
      });

      console.log('Demo verification code:', code);
      
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

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check the verification code
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('phone_verification_code, phone_verification_expires_at')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        toast({
          title: "Error",
          description: "Failed to verify code",
          variant: "destructive"
        });
        return;
      }

      // Check if code matches and hasn't expired
      const now = new Date();
      const expiresAt = new Date(profile.phone_verification_expires_at);
      
      if (profile.phone_verification_code !== verificationCode) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect",
          variant: "destructive"
        });
        return;
      }

      if (now > expiresAt) {
        toast({
          title: "Code Expired",
          description: "The verification code has expired. Please request a new one.",
          variant: "destructive"
        });
        return;
      }

      // Mark phone as verified
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expires_at: null,
          is_available: true // Enable availability once verified
        })
        .eq('id', userId);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to verify phone number",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      });

      onVerificationComplete();
      
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
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
        <CardTitle className="text-xl">Verify Your Phone Number</CardTitle>
        <p className="text-muted-foreground">
          We need to verify your phone number to complete registration
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-muted rounded-lg">
          <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">{phoneNumber}</p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll send a verification code to this number
          </p>
        </div>

        {!codeSent ? (
          <div className="space-y-4">
            <Button 
              onClick={sendVerificationCode}
              disabled={isLoading}
              className="w-full cricket-gradient text-white"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
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
              <Label htmlFor="verification-code">Enter Verification Code</Label>
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
            </div>

            <Button 
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full cricket-gradient text-white"
            >
              {isLoading ? 'Verifying...' : 'Verify Phone Number'}
            </Button>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCodeSent(false)}
                className="flex-1"
              >
                Resend Code
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
