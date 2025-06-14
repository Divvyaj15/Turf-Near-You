
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAuthSubmit = () => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneSignIn = async (
    phoneNumber: string,
    password: string,
    setIsLoading: (loading: boolean) => void,
    validatePhoneNumber: (phone: string) => boolean
  ) => {
    setIsLoading(true);

    try {
      if (!validatePhoneNumber(phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Find user by phone number first
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, phone_verified')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (profileError || !profile) {
        toast({
          title: "Account Not Found",
          description: "No verified account found with this phone number",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!profile.phone_verified) {
        toast({
          title: "Phone Not Verified",
          description: "Please complete phone verification first or sign in with email.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Get user email from profiles table
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', profile.id)
        .single();

      if (userError || !userProfile) {
        toast({
          title: "Error",
          description: "Unable to find user account details",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Sign in with email and password
      const result = await signIn(userProfile.email, password);
      
      if (!result.error) {
        toast({
          title: "Success! 📱",
          description: "Successfully signed in with phone number",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "Invalid phone number or password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerRegistrationComplete = async (
    ownerData: any,
    tempUserData: {email: string, password: string, fullName: string, phoneNumber: string} | null,
    setIsLoading: (loading: boolean) => void,
    setStep: (step: 'auth' | 'role' | 'owner-details' | 'complete') => void,
    setTempUserData: (data: any) => void
  ) => {
    if (!tempUserData) return;
    
    setIsLoading(true);
    
    try {
      // First create the user account
      const result = await signUp(tempUserData.email, tempUserData.password, tempUserData.fullName, 'turf_owner', tempUserData.phoneNumber);
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      setStep('complete');
      toast({
        title: "Registration Successful! 🎉",
        description: "Your turf owner account has been created. Please verify your email to continue.",
      });
      
      setTempUserData(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularSubmit = async (
    isSignUp: boolean,
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    selectedRole: 'customer' | 'turf_owner' | null,
    setIsLoading: (loading: boolean) => void,
    setStep: (step: 'auth' | 'role' | 'owner-details' | 'complete' | 'otp') => void,
    setTempUserData: (data: any) => void,
    validateSignUpFields: (fullName: string, phoneNumber: string) => boolean
  ) => {
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        // Validate required fields
        if (!validateSignUpFields(fullName, phoneNumber)) {
          setIsLoading(false);
          return;
        }
        
        if (!selectedRole) {
          setStep('role');
          setIsLoading(false);
          return;
        }
        
        // For turf owner, store temp data and go to owner details
        if (selectedRole === 'turf_owner') {
          setTempUserData({ email, password, fullName, phoneNumber });
          setStep('owner-details');
          setIsLoading(false);
          return;
        }
        
        // For customer, proceed with normal signup using OTP
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              role: selectedRole,
              phone_number: phoneNumber
            }
          }
        });
        
        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Account Created! 📧",
          description: "Please check your email for the verification code.",
        });
        
        // Redirect to email verification page with email parameter
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        console.log('Attempting sign in with:', email);
        result = await signIn(email, password);
        
        if (!result.error) {
          toast({
            title: "Welcome Back! 👋",
            description: "Successfully logged in to your account",
          });
        }
      }

      if (result?.error) {
        console.error('Auth error:', result.error);
        let errorMessage = result.error.message;
        
        // Provide user-friendly error messages
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePhoneSignIn,
    handleOwnerRegistrationComplete,
    handleRegularSubmit
  };
};
