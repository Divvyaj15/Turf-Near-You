
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useAuthState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'turf_owner' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'role' | 'owner-details' | 'complete'>('auth');
  const [tempUserData, setTempUserData] = useState<{email: string, password: string, fullName: string} | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setSelectedRole(null);
    setStep('auth');
    setIsSignUp(false);
    setTempUserData(null);
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
    setSelectedRole,
    setIsLoading,
    setStep,
    setTempUserData,
    
    // Handlers
    resetForm,
    handleToggleMode
  };
};
