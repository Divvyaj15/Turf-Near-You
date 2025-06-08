
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CompletionScreenProps {
  onReturnHome: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onReturnHome }) => {
  return (
    <Card className="w-full max-w-md text-center shadow-2xl">
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="text-xl font-semibold mb-4">Registration Complete!</h3>
        <p className="text-muted-foreground mb-6">
          Your turf owner account has been created successfully! Our team will review your business information within 24-48 hours and send you an email with the next steps.
        </p>
        <Button onClick={onReturnHome} className="w-full">
          Return to Home
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompletionScreen;
