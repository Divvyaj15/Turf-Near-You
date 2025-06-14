
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, ArrowLeft } from 'lucide-react';
import { useOTPAuth } from '@/hooks/auth/useOTPAuth';

interface OTPAuthProps {
  onBackToAuth: () => void;
}

const OTPAuth: React.FC<OTPAuthProps> = ({ onBackToAuth }) => {
  const {
    isLoading,
    otpSent,
    email,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTPFlow
  } = useOTPAuth();

  const [emailInput, setEmailInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    const success = await sendOTP(emailInput);
    if (success) {
      setCountdown(60);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    
    await verifyOTP(otpCode);
  };

  const handleResendOTP = async () => {
    const success = await resendOTP();
    if (success) {
      setCountdown(60);
    }
  };

  const handleBackToEmail = () => {
    resetOTPFlow();
    setOtpCode('');
  };

  if (!otpSent) {
    return (
      <Card className="shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 cricket-gradient rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">TurfConnect</span>
          </div>
          <CardTitle className="text-2xl">Sign In with Email OTP</CardTitle>
          <p className="text-muted-foreground">
            Enter your email to receive a 6-digit verification code
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full cricket-gradient text-white hover:opacity-90" 
              disabled={isLoading || !emailInput.trim()}
            >
              {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={onBackToAuth}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 cricket-gradient rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary">Verify Email</span>
        </div>
        <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium text-primary">{email}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <label className="text-sm font-medium">Enter verification code</label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
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
            type="submit"
            className="w-full cricket-gradient text-white hover:opacity-90" 
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
          </Button>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend in {countdown}s
            </p>
          ) : (
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="p-0 h-auto text-primary"
            >
              {isLoading ? 'Resending...' : 'Resend verification code'}
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          onClick={handleBackToEmail}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Email Entry
        </Button>
      </CardContent>
    </Card>
  );
};

export default OTPAuth;
