
import { useNavigate } from 'react-router-dom';
import { useAuthState } from './auth/useAuthState';
import { useAuthValidation } from './auth/useAuthValidation';
import { useAuthSubmit } from './auth/useAuthSubmit';
import { useAuthNavigation } from './auth/useAuthNavigation';

export const useAuthFlow = () => {
  const navigate = useNavigate();
  
  // Use smaller, focused hooks
  const {
    isSignUp,
    email,
    password,
    fullName,
    selectedRole,
    isLoading,
    step,
    tempUserData,
    setEmail,
    setPassword,
    setFullName,
    setSelectedRole,
    setIsLoading,
    setStep,
    setTempUserData,
    resetForm,
    handleToggleMode
  } = useAuthState();

  const { validateSignUpFields } = useAuthValidation();
  const { handleOwnerRegistrationComplete, handleRegularSubmit } = useAuthSubmit();
  
  // Set up navigation effects
  useAuthNavigation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegularSubmit(
      isSignUp,
      email,
      password,
      fullName,
      selectedRole,
      setIsLoading,
      (newStep: string) => setStep(newStep as any),
      setTempUserData,
      validateSignUpFields
    );
  };


  const handleRoleSelect = (role: 'customer' | 'turf_owner') => {
    setSelectedRole(role);
    setStep('auth');
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

  const handleOwnerRegistrationCompleteWrapper = async (ownerData: any) => {
    await handleOwnerRegistrationComplete(
      ownerData,
      tempUserData,
      setIsLoading,
      (newStep: string) => setStep(newStep as any),
      setTempUserData
    );
  };


  return {
    // State
    isSignUp,
    email,
    password,
    fullName,
    selectedRole,
    isLoading,
    step,
    tempUserData,
    
    // Setters
    setEmail,
    setPassword,
    setFullName,
    
    // Handlers
    handleSubmit,
    handleToggleMode,
    handleChangeRole,
    handleBackToAuth,
    handleReturnHome,
    handleRoleSelect,
    handleOwnerRegistrationComplete: handleOwnerRegistrationCompleteWrapper
  };
};
