import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OwnerRegistrationFormProps {
  onBack: () => void;
  onComplete: (ownerData: any) => void;
  tempUserData?: {email: string, password: string, fullName: string} | null;
}

const OwnerRegistrationForm: React.FC<OwnerRegistrationFormProps> = ({ onBack, onComplete, tempUserData }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: tempUserData?.fullName || '',
    businessType: '',
    contactPhone: '',
    contactEmail: tempUserData?.email || '',
    address: '',
    yearsOfOperation: [1]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If we have tempUserData, this is part of the signup flow
      if (tempUserData) {
        // Just pass the form data back to the parent to handle user creation and owner data insertion
        onComplete(formData);
        return;
      }

      // Otherwise, this is updating an existing user (shouldn't happen in new flow, but keeping for safety)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('turf_owners')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          business_type: formData.businessType,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          address: formData.address,
          years_of_operation: formData.yearsOfOperation[0]
        });

      if (error) throw error;

      toast({
        title: "Registration Submitted!",
        description: "Your turf owner application has been submitted for review. You'll receive an email within 24-48 hours.",
      });

      onComplete(formData);
    } catch (error: any) {
      console.error('Owner registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-3">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Complete Your Business Registration</CardTitle>
        <p className="text-muted-foreground">
          {tempUserData ? 
            `Hi ${tempUserData.fullName}, tell us about your turf business to complete your registration` :
            "Tell us about your turf business to get started"
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Elite Sports Arena"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                placeholder="+91 98765 43210"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="business@example.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address *</Label>
            <Input
              id="address"
              placeholder="Complete address with area, Mumbai"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Years of Operation: {formData.yearsOfOperation[0]} year(s)</Label>
            <Slider
              value={formData.yearsOfOperation}
              onValueChange={(value) => handleInputChange('yearsOfOperation', value)}
              max={30}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your account will be created immediately</li>
              <li>• Our team will review your business information within 24-48 hours</li>
              <li>• You'll receive an email confirmation once approved</li>
              <li>• You can then start listing your turfs and managing bookings</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OwnerRegistrationForm;
