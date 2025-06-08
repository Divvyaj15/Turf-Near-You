
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import RoleSelection from '@/components/RoleSelection';
import OwnerRegistrationForm from '@/components/OwnerRegistrationForm';

interface RegistrationStepsProps {
  step: 'role' | 'owner-details';
  selectedRole: 'customer' | 'turf_owner' | null;
  tempUserData: {email: string, password: string, fullName: string} | null;
  onBackToAuth: () => void;
  onRoleSelect: (role: 'customer' | 'turf_owner') => void;
  onOwnerRegistrationComplete: (ownerData: any) => void;
}

const RegistrationSteps: React.FC<RegistrationStepsProps> = ({
  step,
  selectedRole,
  tempUserData,
  onBackToAuth,
  onRoleSelect,
  onOwnerRegistrationComplete
}) => {
  if (step === 'role') {
    return (
      <div className="w-full max-w-4xl">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={onBackToAuth}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign Up
        </Button>

        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <RoleSelection 
              selectedRole={selectedRole}
              onRoleSelect={onRoleSelect}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'owner-details') {
    return (
      <div className="w-full max-w-4xl">
        <OwnerRegistrationForm 
          onBack={onBackToAuth}
          onComplete={onOwnerRegistrationComplete}
          tempUserData={tempUserData}
        />
      </div>
    );
  }

  return null;
};

export default RegistrationSteps;
