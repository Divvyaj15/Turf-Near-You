
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AuthStepRenderer from './AuthStepRenderer';
import { useAuthFlow } from '@/hooks/useAuthFlow';

const AuthContainer = () => {
  const navigate = useNavigate();
  const {
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
    handleOwnerRegistrationComplete
  } = useAuthFlow();

  if (step === 'role' || step === 'owner-details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <AuthStepRenderer
          step={step}
          isSignUp={isSignUp}
          email={email}
          password={password}
          fullName={fullName}
          selectedRole={selectedRole}
          isLoading={isLoading}
          tempUserData={tempUserData}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleSubmit}
          onToggleMode={handleToggleMode}
          onChangeRole={handleChangeRole}
          onBackToAuth={handleBackToAuth}
          onRoleSelect={handleRoleSelect}
          onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
          onReturnHome={handleReturnHome}
        />
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <AuthStepRenderer
          step={step}
          isSignUp={isSignUp}
          email={email}
          password={password}
          fullName={fullName}
          selectedRole={selectedRole}
          isLoading={isLoading}
          tempUserData={tempUserData}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleSubmit}
          onToggleMode={handleToggleMode}
          onChangeRole={handleChangeRole}
          onBackToAuth={handleBackToAuth}
          onRoleSelect={handleRoleSelect}
          onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
          onReturnHome={handleReturnHome}
        />
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

        <AuthStepRenderer
          step={step}
          isSignUp={isSignUp}
          email={email}
          password={password}
          fullName={fullName}
          selectedRole={selectedRole}
          isLoading={isLoading}
          tempUserData={tempUserData}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleSubmit}
          onToggleMode={handleToggleMode}
          onChangeRole={handleChangeRole}
          onBackToAuth={handleBackToAuth}
          onRoleSelect={handleRoleSelect}
          onOwnerRegistrationComplete={handleOwnerRegistrationComplete}
          onReturnHome={handleReturnHome}
        />
      </div>
    </div>
  );
};

export default AuthContainer;
