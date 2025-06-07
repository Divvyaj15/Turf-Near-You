
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Building2, MapPin, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddTurfFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SPORTS_OPTIONS = [
  'Football', 'Cricket', 'Basketball', 'Tennis', 'Badminton', 
  'Volleyball', 'Hockey', 'Swimming', 'Table Tennis'
];

const AMENITIES_OPTIONS = [
  'Parking', 'Restrooms', 'Changing Rooms', 'Shower', 'Drinking Water',
  'First Aid', 'Equipment Rental', 'Lighting', 'Security', 'Cafeteria'
];

const SURFACE_TYPES = [
  'Natural Grass', 'Artificial Turf', 'Concrete', 'Wooden', 'Rubber', 'Clay'
];

const AddTurfForm: React.FC<AddTurfFormProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    area: '',
    contactPhone: '',
    contactEmail: '',
    supportedSports: [] as string[],
    amenities: [] as string[],
    surfaceType: '',
    capacity: '',
    basePricePerHour: '',
    weekendPremiumPercentage: '0',
    peakHoursPremiumPercentage: '0',
    peakHoursStart: '18:00',
    peakHoursEnd: '22:00'
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSportsChange = (sport: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        supportedSports: [...prev.supportedSports, sport] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        supportedSports: prev.supportedSports.filter(s => s !== sport) 
      }));
    }
  };

  const handleAmenitiesChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        amenities: [...prev.amenities, amenity] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        amenities: prev.amenities.filter(a => a !== amenity) 
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive"
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (coverImageIndex >= index && coverImageIndex > 0) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  const uploadImages = async (ownerId: string) => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('turf-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('turf-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get turf owner ID
      const { data: ownerData, error: ownerError } = await supabase
        .from('turf_owners')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (ownerError) throw new Error('Owner profile not found');

      // Upload images
      let imageUrls: string[] = [];
      let coverImageUrl = '';
      
      if (images.length > 0) {
        imageUrls = await uploadImages(ownerData.id);
        coverImageUrl = imageUrls[coverImageIndex] || imageUrls[0];
      }

      // Insert turf data
      const { error: insertError } = await supabase
        .from('turfs')
        .insert({
          owner_id: ownerData.id,
          name: formData.name,
          description: formData.description || null,
          address: formData.address,
          area: formData.area,
          contact_phone: formData.contactPhone || null,
          contact_email: formData.contactEmail || null,
          supported_sports: formData.supportedSports,
          amenities: formData.amenities,
          surface_type: formData.surfaceType || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          cover_image_url: coverImageUrl || null,
          images: imageUrls,
          base_price_per_hour: parseFloat(formData.basePricePerHour),
          weekend_premium_percentage: parseFloat(formData.weekendPremiumPercentage),
          peak_hours_premium_percentage: parseFloat(formData.peakHoursPremiumPercentage),
          peak_hours_start: formData.peakHoursStart,
          peak_hours_end: formData.peakHoursEnd
        });

      if (insertError) throw insertError;

      toast({
        title: "Turf Added Successfully!",
        description: "Your turf has been registered and is now live.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding turf:', error);
      toast({
        title: "Failed to Add Turf",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Add New Turf</CardTitle>
            <p className="text-muted-foreground">
              Register your turf to start accepting bookings
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Turf Name *</Label>
                    <Input
                      id="name"
                      placeholder="Elite Sports Arena"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area/Location *</Label>
                    <Input
                      id="area"
                      placeholder="Bandra West, Mumbai"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete address with landmarks"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your turf facilities and unique features"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surfaceType">Surface Type</Label>
                    <Select value={formData.surfaceType} onValueChange={(value) => handleInputChange('surfaceType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select surface" />
                      </SelectTrigger>
                      <SelectContent>
                        {SURFACE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Players)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="22"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sports & Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Supported Sports</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {SPORTS_OPTIONS.map(sport => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={formData.supportedSports.includes(sport)}
                        onCheckedChange={(checked) => handleSportsChange(sport, checked as boolean)}
                      />
                      <Label htmlFor={sport} className="text-sm">{sport}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenitiesChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Images (Max 5)
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {images.length}/5 images uploaded
                    </span>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              type="button"
                              size="sm"
                              variant={coverImageIndex === index ? "default" : "outline"}
                              onClick={() => setCoverImageIndex(index)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Cover
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                              className="p-1 h-auto"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePricePerHour">Base Price per Hour (₹) *</Label>
                    <Input
                      id="basePricePerHour"
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={formData.basePricePerHour}
                      onChange={(e) => handleInputChange('basePricePerHour', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weekendPremiumPercentage">Weekend Premium (%)</Label>
                    <Input
                      id="weekendPremiumPercentage"
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      value={formData.weekendPremiumPercentage}
                      onChange={(e) => handleInputChange('weekendPremiumPercentage', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peakHoursPremiumPercentage">Peak Hours Premium (%)</Label>
                    <Input
                      id="peakHoursPremiumPercentage"
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      value={formData.peakHoursPremiumPercentage}
                      onChange={(e) => handleInputChange('peakHoursPremiumPercentage', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="peakHoursStart">Peak Hours Start</Label>
                    <Input
                      id="peakHoursStart"
                      type="time"
                      value={formData.peakHoursStart}
                      onChange={(e) => handleInputChange('peakHoursStart', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="peakHoursEnd">Peak Hours End</Label>
                    <Input
                      id="peakHoursEnd"
                      type="time"
                      value={formData.peakHoursEnd}
                      onChange={(e) => handleInputChange('peakHoursEnd', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding Turf...' : 'Add Turf'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTurfForm;
