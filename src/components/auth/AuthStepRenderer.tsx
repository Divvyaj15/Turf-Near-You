
import React from 'react';
import AuthForm from '@/components/AuthForm';
import RegistrationSteps from '@/components/RegistrationSteps';
import CompletionScreen from '@/components/CompletionScreen';
import OTPAuth from '@/components/auth/OTPAuth';

interface AuthStepRendererProps {
  step: 'auth' | 'role' | 'owner-details' | 'complete';
  isSignUp: boolean;
  email: string;
  password: string;
  fullName: string;
  selectedRole: 'customer' | 'turf_owner' | null;
  isLoading: boolean;
  tempUserData: {email: string, password: string, fullName: string} | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onChangeRole: () => void;
  onBackToAuth: () => void;
  onRoleSelect: (role: 'customer' | 'turf_owner') => void;
  onOwnerRegistrationComplete: (ownerData: any) => void;
  onReturnHome: () => void;
}

const AuthStepRenderer: React.FC<AuthStepRendererProps> = ({
  step,
  isSignUp,
  email,
  password,
  fullName,
  selectedRole,
  isLoading,
  tempUserData,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSubmit,
  onToggleMode,
  onChangeRole,
  onBackToAuth,
  onRoleSelect,
  onOwnerRegistrationComplete,
  onReturnHome
}) => {
  if (step === 'role' || step === 'owner-details') {
    return (
      <RegistrationSteps
        step={step}
        selectedRole={selectedRole}
        tempUserData={tempUserData}
        onBackToAuth={onBackToAuth}
        onRoleSelect={onRoleSelect}
        onOwnerRegistrationComplete={onOwnerRegistrationComplete}
      />
    );
  }

  if (step === 'complete') {
    return <CompletionScreen onReturnHome={onReturnHome} />;
  }


  return (
    <AuthForm
      isSignUp={isSignUp}
      email={email}
      password={password}
      fullName={fullName}
      selectedRole={selectedRole}
      isLoading={isLoading}
      onEmailChange={onEmailChange}
      onPasswordChange={onPasswordChange}
      onFullNameChange={onFullNameChange}
      onSubmit={onSubmit}
      onToggleMode={onToggleMode}
      onChangeRole={onChangeRole}
    />
  );
};

export default AuthStepRenderer;
