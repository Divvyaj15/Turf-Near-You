
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PlayerProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    gender: '',
    location: '',
    preferredSports: [] as string[],
    skillLevel: '',
    maxTravelDistance: '25',
    whatsappNumber: '',
    preferredContact: 'whatsapp'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const sports = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Volleyball'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSportChange = (sport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredSports: checked 
        ? [...prev.preferredSports, sport]
        : prev.preferredSports.filter(s => s !== sport)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          age: parseInt(formData.age),
          gender: formData.gender,
          location: formData.location,
          max_travel_distance: parseInt(formData.maxTravelDistance),
          whatsapp_number: formData.whatsappNumber,
          preferred_contact: formData.preferredContact,
          is_available: true
        });

      if (profileError) throw profileError;

      // Create sports profiles for each selected sport
      for (const sport of formData.preferredSports) {
        const { error: sportError } = await supabase
          .from('user_sports_profiles')
          .insert({
            user_id: user.id,
            sport: sport.toLowerCase(),
            skill_level: skillLevels.indexOf(formData.skillLevel) + 1,
            experience_level: formData.skillLevel.toLowerCase(),
            is_active: true
          });

        if (sportError) throw sportError;
      }

      toast({
        title: "Profile Created!",
        description: "Your player profile has been set up successfully.",
      });

      navigate('/find-players');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Your Player Profile</CardTitle>
            <p className="text-center text-muted-foreground">
              Set up your profile to find players and join games in your area
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Your age"
                    min="13"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter your city/area"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Sports *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sports.map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={formData.preferredSports.includes(sport)}
                        onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
                      />
                      <Label htmlFor={sport} className="text-sm">{sport}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel">Overall Skill Level</Label>
                <Select value={formData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTravelDistance">Max Travel Distance (km)</Label>
                  <Input
                    id="maxTravelDistance"
                    type="number"
                    value={formData.maxTravelDistance}
                    onChange={(e) => handleInputChange('maxTravelDistance', e.target.value)}
                    placeholder="25"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="WhatsApp number (optional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || formData.preferredSports.length === 0}
              >
                {isLoading ? 'Creating Profile...' : 'Complete Profile Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerProfileSetup;
