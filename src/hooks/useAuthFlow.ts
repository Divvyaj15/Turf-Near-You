import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthFlow = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'turf_owner' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'role' | 'owner-details' | 'complete'>('auth');
  const [tempUserData, setTempUserData] = useState<{email: string, password: string, fullName: string, phoneNumber: string} | null>(null);
  
  const { signUp, signIn, user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        // Validate required fields
        if (!fullName.trim()) {
          toast({
            title: "Missing Information",
            description: "Please enter your full name",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!phoneNumber.trim()) {
          toast({
            title: "Missing Information",
            description: "Please enter your phone number for verification",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid phone number",
            variant: "destructive"
          });
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
        
        // For customer, proceed with normal signup
        result = await signUp(email, password, fullName, selectedRole, phoneNumber);
        
        if (!result.error) {
          toast({
            title: "Account Created Successfully! 🎉",
            description: "Please check your email for verification, then verify your phone number.",
          });
          // Redirect to email verification page with email parameter
          navigate(`/email-verification?email=${encodeURIComponent(email)}`);
        }
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

      if (result.error) {
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

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhoneNumber('');
    setSelectedRole(null);
    setStep('auth');
    setIsSignUp(false);
    setTempUserData(null);
  };

  const handleRoleSelect = (role: 'customer' | 'turf_owner') => {
    setSelectedRole(role);
    setStep('auth');
  };

  const handleOwnerRegistrationComplete = async (ownerData: any) => {
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

  const handleToggleMode = () => {
    const newIsSignUp = !isSignUp;
    setIsSignUp(newIsSignUp);
    
    // Update URL to reflect the mode change
    if (newIsSignUp) {
      setSearchParams({ mode: 'register' });
    } else {
      setSearchParams({});
    }
    
    resetForm();
  };

  const handleChangeRole = () => {
    setStep('role');
  };

  const handleBackToAuth = () => {
    setStep('auth');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return {
    // State
    isSignUp,
    email,
    password,
    fullName,
    phoneNumber,
    selectedRole,
    isLoading,
    step,
    tempUserData,
    
    // Setters
    setEmail,
    setPassword,
    setFullName,
    setPhoneNumber,
    
    // Handlers
    handleSubmit,
    handlePhoneSignIn,
    handleToggleMode,
    handleChangeRole,
    handleBackToAuth,
    handleReturnHome,
    handleRoleSelect,
    handleOwnerRegistrationComplete
  };
};
