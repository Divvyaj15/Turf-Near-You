
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import RegistrationSteps from '@/components/RegistrationSteps';
import CompletionScreen from '@/components/CompletionScreen';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'turf_owner' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'role' | 'owner-details' | 'complete'>('auth');
  const [tempUserData, setTempUserData] = useState<{email: string, password: string, fullName: string} | null>(null);
  
  const { signUp, signIn, user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'turf_owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
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
        
        if (!selectedRole) {
          setStep('role');
          setIsLoading(false);
          return;
        }
        
        // For turf owner, store temp data and go to owner details
        if (selectedRole === 'turf_owner') {
          setTempUserData({ email, password, fullName });
          setStep('owner-details');
          setIsLoading(false);
          return;
        }
        
        // For customer, proceed with normal signup
        result = await signUp(email, password, fullName, selectedRole);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isSignUp && selectedRole === 'customer') {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email to verify your account.",
          });
        } else if (!isSignUp) {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      }
    } catch (error) {
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
      const result = await signUp(tempUserData.email, tempUserData.password, tempUserData.fullName, 'turf_owner');
      
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
    setIsSignUp(!isSignUp);
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

  const backgroundContainer = (
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
      </div>
    </div>
  );

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

        <AuthForm
          isSignUp={isSignUp}
          email={email}
          password={password}
          fullName={fullName}
          selectedRole={selectedRole}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleSubmit}
          onToggleMode={handleToggleMode}
          onChangeRole={handleChangeRole}
        />
      </div>
    </div>
  );
};

export default Auth;
