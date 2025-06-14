
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useOTPAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const sendOTP = async (emailAddress: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        toast({
          title: "Failed to Send OTP",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      setEmail(emailAddress);
      setOtpSent(true);
      toast({
        title: "OTP Sent! 📧",
        description: "Check your email for the 6-digit verification code",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (token: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Invalid OTP",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success! 🎉",
        description: "You have been successfully signed in",
      });
      
      navigate('/');
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    return await sendOTP(email);
  };

  const resetOTPFlow = () => {
    setOtpSent(false);
    setEmail('');
  };

  return {
    isLoading,
    otpSent,
    email,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTPFlow
  };
};
