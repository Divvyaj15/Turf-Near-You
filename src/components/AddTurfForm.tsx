
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Users, Clock, IndianRupee } from 'lucide-react';

const turfSchema = z.object({
  name: z.string().min(2, 'Turf name must be at least 2 characters'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().min(10, 'Please provide a complete address'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  basePrice: z.number().min(1, 'Base price must be greater than 0'),
  contactPhone: z.string().min(10, 'Please provide a valid phone number'),
  contactEmail: z.string().email('Please provide a valid email address'),
  surfaceType: z.string().min(1, 'Surface type is required'),
  supportedSports: z.array(z.string()).min(1, 'Select at least one sport'),
  amenities: z.array(z.string()),
  peakHoursStart: z.string(),
  peakHoursEnd: z.string(),
  weekendPremium: z.number().min(0, 'Weekend premium cannot be negative'),
  peakHoursPremium: z.number().min(0, 'Peak hours premium cannot be negative'),
});

type TurfFormData = z.infer<typeof turfSchema>;

interface AddTurfFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SPORTS_OPTIONS = [
  'Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 
  'Volleyball', 'Hockey', 'Rugby', 'Baseball', 'Softball'
];

const AMENITIES_OPTIONS = [
  'Parking', 'Restrooms', 'Changing Rooms', 'Showers', 'Lighting',
  'Seating Area', 'Cafeteria', 'Equipment Rental', 'First Aid',
  'WiFi', 'Air Conditioning', 'Water Fountain'
];

const SURFACE_TYPES = [
  'Natural Grass', 'Artificial Turf', 'Clay', 'Concrete', 'Rubber',
  'Synthetic', 'Astro Turf', 'Indoor Court', 'Wooden Floor'
];

const AddTurfForm: React.FC<AddTurfFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TurfFormData>({
    resolver: zodResolver(turfSchema),
    defaultValues: {
      name: '',
      area: '',
      address: '',
      description: '',
      capacity: 10,
      basePrice: 500,
      contactPhone: '',
      contactEmail: '',
      surfaceType: '',
      supportedSports: [],
      amenities: [],
      peakHoursStart: '18:00',
      peakHoursEnd: '22:00',
      weekendPremium: 0,
      peakHoursPremium: 0,
    },
  });

  const onSubmit = async (data: TurfFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a turf",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get owner data first
      const { data: ownerData, error: ownerError } = await supabase
        .from('turf_owners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (ownerError || !ownerData) {
        toast({
          title: "Error",
          description: "Owner information not found. Please complete your registration first.",
          variant: "destructive"
        });
        return;
      }

      // Insert turf data with pending status
      const turfData = {
        name: data.name,
        area: data.area,
        address: data.address,
        description: data.description,
        capacity: data.capacity,
        base_price_per_hour: data.basePrice,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        surface_type: data.surfaceType,
        supported_sports: data.supportedSports,
        amenities: data.amenities,
        peak_hours_start: data.peakHoursStart,
        peak_hours_end: data.peakHoursEnd,
        weekend_premium_percentage: data.weekendPremium,
        peak_hours_premium_percentage: data.peakHoursPremium,
        owner_id: ownerData.id,
        status: 'pending', // Set status to pending for admin approval
      };

      const { data: insertedTurf, error: turfError } = await supabase
        .from('turfs')
        .insert(turfData)
        .select()
        .single();

      if (turfError) {
        console.error('Error inserting turf:', turfError);
        toast({
          title: "Error",
          description: "Failed to submit turf. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Send approval email to admin
      const { error: emailError } = await supabase.functions.invoke('send-turf-approval-email', {
        body: {
          turfData: insertedTurf,
          ownerData: ownerData
        }
      });

      if (emailError) {
        console.error('Error sending approval email:', emailError);
        // Don't show error to user as turf was still created successfully
      }

      toast({
        title: "Turf Submitted Successfully! 🎉",
        description: "Your turf has been submitted for admin approval. You'll be notified once it's reviewed.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error in turf submission:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <CardTitle className="flex items-center text-2xl">
          <Building2 className="w-6 h-6 mr-2" />
          Register Your Turf
        </CardTitle>
        <p className="text-muted-foreground">
          Fill out the details below to register your turf. It will be reviewed by our team before going live.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turf Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter turf name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area/Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bandra West, Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Complete Address *
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter complete address with landmarks"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your turf, facilities, and any special features"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Capacity *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Max players"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      Base Price/Hour *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="₹500"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surfaceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select surface" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SURFACE_TYPES.map((surface) => (
                          <SelectItem key={surface} value={surface}>
                            {surface}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Phone *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact Email *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourturf.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Supported Sports */}
            <FormField
              control={form.control}
              name="supportedSports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supported Sports * (Select at least one)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {SPORTS_OPTIONS.map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox
                          id={sport}
                          checked={field.value?.includes(sport)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, sport]);
                            } else {
                              field.onChange(field.value?.filter((s) => s !== sport));
                            }
                          }}
                        />
                        <Label htmlFor={sport} className="text-sm">
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenities */}
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities (Optional)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {AMENITIES_OPTIONS.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={field.value?.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, amenity]);
                            } else {
                              field.onChange(field.value?.filter((a) => a !== amenity));
                            }
                          }}
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Operating Hours and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="peakHoursStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Peak Hours Start
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peakHoursEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Hours End</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peakHoursPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Hours Premium (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekendPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Premium (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="cricket-gradient text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddTurfForm;
