
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import RegistrationSteps from '@/components/RegistrationSteps';
import CompletionScreen from '@/components/CompletionScreen';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          toast({
            title: "Error",
            description: "Please enter your full name",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!phoneNumber.trim()) {
          toast({
            title: "Error",
            description: "Please enter your phone number",
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
            title: "Account Created!",
            description: "Please check your email for the verification code.",
          });
          // Redirect to email verification page with email parameter
          navigate(`/email-verification?email=${encodeURIComponent(email)}`);
        }
      } else {
        console.log('Attempting sign in with:', email);
        result = await signIn(email, password);
        
        if (!result.error) {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      }

      if (result.error) {
        console.error('Auth error:', result.error);
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
      // Find user by phone number first
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, phone_verified')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "No account found with this phone number",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!profile.phone_verified) {
        toast({
          title: "Error",
          description: "Phone number not verified. Please complete verification first.",
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
          description: "Unable to find user account",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Sign in with email and password
      const result = await signIn(userProfile.email, password);
      
      if (!result.error) {
        toast({
          title: "Success",
          description: "Logged in successfully with phone number!",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid phone number or password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      setStep('complete');
      toast({
        title: "Registration Complete!",
        description: "Your turf owner account has been created and your application submitted for review.",
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

  if (step === 'role' || step === 'owner-details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <RegistrationSteps
          step={step}
          selectedRole={selectedRole}
          tempUserData={tempUserData}
          onBackToAuth={handleBackToAuth}
          onRoleSelect={handleRoleSelect}
          onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
        />
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <CompletionScreen onReturnHome={handleReturnHome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {step === 'role' ? (
          <RegistrationSteps
            step={step}
            selectedRole={selectedRole}
            tempUserData={tempUserData}
            onBackToAuth={handleBackToAuth}
            onRoleSelect={handleRoleSelect}
            onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
          />
        ) : step === 'owner-details' ? (
          <RegistrationSteps
            step={step}
            selectedRole={selectedRole}
            tempUserData={tempUserData}
            onBackToAuth={handleBackToAuth}
            onRoleSelect={handleRoleSelect}
            onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
          />
        ) : step === 'complete' ? (
          <CompletionScreen onReturnHome={handleReturnHome} />
        ) : (
          <AuthForm
            isSignUp={isSignUp}
            email={email}
            password={password}
            fullName={fullName}
            phoneNumber={phoneNumber}
            selectedRole={selectedRole}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onFullNameChange={setFullName}
            onPhoneNumberChange={setPhoneNumber}
            onSubmit={handleSubmit}
            onPhoneSignIn={handlePhoneSignIn}
            onToggleMode={handleToggleMode}
            onChangeRole={handleChangeRole}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
