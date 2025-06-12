import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, MapPin, DollarSign, Clock, Users, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddTurfFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AddTurfForm: React.FC<AddTurfFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    address: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    base_price_per_hour: '',
    capacity: '',
    surface_type: 'grass',
    weekend_premium_percentage: '0',
    peak_hours_premium_percentage: '0',
  });

  const [businessData, setBusinessData] = useState({
    business_name: '',
    owner_name: '',
    business_type: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    years_of_operation: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleBusinessInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBusinessData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'sports' | 'amenities') => {
    const { value, checked } = e.target;
    
    if (type === 'sports') {
      setSelectedSports(prev =>
        checked ? [...prev, value] : prev.filter(item => item !== value)
      );
    } else {
      setSelectedAmenities(prev =>
        checked ? [...prev, value] : prev.filter(item => item !== value)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!formData.name || !formData.area || !formData.address || !formData.base_price_per_hour) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // First, create or update turf owner record
      const ownerData = {
        user_id: user.id,
        business_name: businessData.business_name,
        owner_name: businessData.owner_name,
        business_type: businessData.business_type,
        contact_phone: businessData.contact_phone,
        contact_email: businessData.contact_email,
        address: businessData.address,
        years_of_operation: businessData.years_of_operation,
        verification_status: 'pending'
      };

      const { data: ownerResult, error: ownerError } = await supabase
        .from('turf_owners')
        .upsert(ownerData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (ownerError) {
        console.error('Owner creation error:', ownerError);
        throw new Error('Failed to create owner profile');
      }

      // Create turf record with pending status
      const turfData = {
        ...formData,
        owner_id: ownerResult.id,
        status: 'pending', // Set to pending instead of active
        supported_sports: selectedSports,
        amenities: selectedAmenities,
        base_price_per_hour: Number(formData.base_price_per_hour),
        capacity: Number(formData.capacity),
        weekend_premium_percentage: Number(formData.weekend_premium_percentage),
        peak_hours_premium_percentage: Number(formData.peak_hours_premium_percentage)
      };

      const { data: turfResult, error: turfError } = await supabase
        .from('turfs')
        .insert(turfData)
        .select()
        .single();

      if (turfError) {
        console.error('Turf creation error:', turfError);
        throw new Error('Failed to create turf');
      }

      // Send approval email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-turf-approval-email', {
          body: {
            turfData: turfResult,
            ownerData: ownerResult
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          // Don't throw error here as turf was created successfully
        }
      } catch (emailError) {
        console.error('Email function error:', emailError);
        // Continue as turf was created successfully
      }

      toast({
        title: "Turf Submitted Successfully!",
        description: "Your turf has been submitted for approval. You'll be notified once it's reviewed.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit turf. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 cricket-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TC</span>
              </div>
              <span className="text-2xl font-bold text-primary">Add New Turf</span>
            </div>
            <CardTitle className="text-2xl">List Your Turf</CardTitle>
            <p className="text-muted-foreground">
              Provide details about your turf to get started
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      type="text"
                      placeholder="Enter business name"
                      value={businessData.business_name}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      type="text"
                      placeholder="Enter owner name"
                      value={businessData.owner_name}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Input
                      id="business_type"
                      type="text"
                      placeholder="Enter business type"
                      value={businessData.business_type}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_of_operation">Years of Operation</Label>
                    <Input
                      id="years_of_operation"
                      type="number"
                      placeholder="Enter years of operation"
                      value={businessData.years_of_operation}
                      onChange={(e) => handleBusinessInputChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: Number(e.target.value)
                        }
                      } as any)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="Enter contact phone"
                      value={businessData.contact_phone}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="Enter contact email"
                      value={businessData.contact_email}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter business address"
                      value={businessData.address}
                      onChange={handleBusinessInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Turf Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Turf Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Turf Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter turf name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      type="text"
                      placeholder="Enter area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="Enter contact phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="Enter contact email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_price_per_hour">Base Price per Hour</Label>
                    <Input
                      id="base_price_per_hour"
                      type="number"
                      placeholder="Enter base price per hour"
                      value={formData.base_price_per_hour}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Enter capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surface_type">Surface Type</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, surface_type: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select surface type" defaultValue={formData.surface_type} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grass">Grass</SelectItem>
                        <SelectItem value="artificial_turf">Artificial Turf</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekend_premium_percentage">Weekend Premium (%)</Label>
                    <Input
                      id="weekend_premium_percentage"
                      type="number"
                      placeholder="Enter weekend premium percentage"
                      value={formData.weekend_premium_percentage}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peak_hours_premium_percentage">Peak Hours Premium (%)</Label>
                    <Input
                      id="peak_hours_premium_percentage"
                      type="number"
                      placeholder="Enter peak hours premium percentage"
                      value={formData.peak_hours_premium_percentage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Sports and Amenities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Supported Sports</h3>
                  <div className="space-y-2">
                    <Label htmlFor="cricket" className="flex items-center space-x-2">
                      <Checkbox id="cricket" value="cricket" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'cricket', checked } } as any, 'sports')} />
                      <span>Cricket</span>
                    </Label>
                    <Label htmlFor="football" className="flex items-center space-x-2">
                      <Checkbox id="football" value="football" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'football', checked } } as any, 'sports')} />
                      <span>Football</span>
                    </Label>
                    <Label htmlFor="badminton" className="flex items-center space-x-2">
                      <Checkbox id="badminton" value="badminton" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'badminton', checked } } as any, 'sports')} />
                      <span>Badminton</span>
                    </Label>
                    <Label htmlFor="tennis" className="flex items-center space-x-2">
                      <Checkbox id="tennis" value="tennis" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'tennis', checked } } as any, 'sports')} />
                      <span>Tennis</span>
                    </Label>
                    <Label htmlFor="basketball" className="flex items-center space-x-2">
                      <Checkbox id="basketball" value="basketball" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'basketball', checked } } as any, 'sports')} />
                      <span>Basketball</span>
                    </Label>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Amenities</h3>
                  <div className="space-y-2">
                    <Label htmlFor="parking" className="flex items-center space-x-2">
                      <Checkbox id="parking" value="parking" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'parking', checked } } as any, 'amenities')} />
                      <span>Parking</span>
                    </Label>
                    <Label htmlFor="washrooms" className="flex items-center space-x-2">
                      <Checkbox id="washrooms" value="washrooms" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'washrooms', checked } } as any, 'amenities')} />
                      <span>Washrooms</span>
                    </Label>
                    <Label htmlFor="changing_rooms" className="flex items-center space-x-2">
                      <Checkbox id="changing_rooms" value="changing_rooms" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'changing_rooms', checked } } as any, 'amenities')} />
                      <span>Changing Rooms</span>
                    </Label>
                    <Label htmlFor="flood_lights" className="flex items-center space-x-2">
                      <Checkbox id="flood_lights" value="flood_lights" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'flood_lights', checked } } as any, 'amenities')} />
                      <span>Flood Lights</span>
                    </Label>
                    <Label htmlFor="refreshments" className="flex items-center space-x-2">
                      <Checkbox id="refreshments" value="refreshments" onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'refreshments', checked } } as any, 'amenities')} />
                      <span>Refreshments</span>
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full cricket-gradient text-white hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Submit Turf
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTurfForm;
