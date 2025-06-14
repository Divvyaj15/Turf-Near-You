
import React from 'react';
import AuthForm from '@/components/AuthForm';
import RegistrationSteps from '@/components/RegistrationSteps';
import CompletionScreen from '@/components/CompletionScreen';
import OTPAuth from '@/components/auth/OTPAuth';

interface AuthStepRendererProps {
  step: 'auth' | 'role' | 'owner-details' | 'complete' | 'otp';
  isSignUp: boolean;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  selectedRole: 'customer' | 'turf_owner' | null;
  isLoading: boolean;
  tempUserData: {email: string, password: string, fullName: string, phoneNumber: string} | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPhoneSignIn: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onChangeRole: () => void;
  onBackToAuth: () => void;
  onRoleSelect: (role: 'customer' | 'turf_owner') => void;
  onOwnerRegistrationComplete: (ownerData: any) => void;
  onReturnHome: () => void;
  onOTPAuth?: () => void;
}

const AuthStepRenderer: React.FC<AuthStepRendererProps> = ({
  step,
  isSignUp,
  email,
  password,
  fullName,
  phoneNumber,
  selectedRole,
  isLoading,
  tempUserData,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onPhoneNumberChange,
  onSubmit,
  onPhoneSignIn,
  onToggleMode,
  onChangeRole,
  onBackToAuth,
  onRoleSelect,
  onOwnerRegistrationComplete,
  onReturnHome,
  onOTPAuth
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

  if (step === 'otp') {
    return <OTPAuth onBackToAuth={onBackToAuth} />;
  }

  return (
    <AuthForm
      isSignUp={isSignUp}
      email={email}
      password={password}
      fullName={fullName}
      phoneNumber={phoneNumber}
      selectedRole={selectedRole}
      isLoading={isLoading}
      onEmailChange={onEmailChange}
      onPasswordChange={onPasswordChange}
      onFullNameChange={onFullNameChange}
      onPhoneNumberChange={onPhoneNumberChange}
      onSubmit={onSubmit}
      onPhoneSignIn={onPhoneSignIn}
      onToggleMode={onToggleMode}
      onChangeRole={onChangeRole}
      onOTPAuth={onOTPAuth}
    />
  );
};

export default AuthStepRenderer;
