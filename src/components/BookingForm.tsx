import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, DollarSign, MapPin, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { Turf } from '@/hooks/useTurfs';

interface BookingFormProps {
  turf: Turf;
  onSuccess?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
}

interface PricingResult {
  hours: number;
  baseAmount: number;
  premiumCharges: number;
  totalAmount: number;
}

const BookingForm = ({ turf, onSuccess, onCancel, onBack }: BookingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const calculatePricing = (): PricingResult | null => {
    if (!selectedDate || !startTime || !endTime) return null;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) return null;

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const baseAmount = hours * turf.base_price_per_hour;
    
    let premiumCharges = 0;
    
    // Weekend premium
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      premiumCharges += baseAmount * (turf.weekend_premium_percentage / 100);
    }
    
    // Peak hours premium
    if (turf.peak_hours_start && turf.peak_hours_end) {
      const peakStart = new Date(`2000-01-01T${turf.peak_hours_start}`);
      const peakEnd = new Date(`2000-01-01T${turf.peak_hours_end}`);
      
      if (start >= peakStart && end <= peakEnd) {
        premiumCharges += baseAmount * (turf.peak_hours_premium_percentage / 100);
      }
    }

    return {
      hours,
      baseAmount,
      premiumCharges,
      totalAmount: baseAmount + premiumCharges
    };
  };

  const pricing = calculatePricing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedDate || !pricing) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createBooking.mutateAsync({
        turf_id: turf.id,
        user_id: user.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        total_hours: pricing.hours,
        base_price: pricing.baseAmount,
        premium_charges: pricing.premiumCharges,
        total_amount: pricing.totalAmount,
        player_name: playerName,
        player_phone: playerPhone,
        player_email: playerEmail || undefined,
        special_requests: specialRequests || undefined,
      });

      toast({
        title: "Success!",
        description: "Your booking has been submitted successfully.",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Turf Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {turf.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {turf.cover_image_url && (
                <img
                  src={turf.cover_image_url}
                  alt={turf.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {turf.area}, {turf.address}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ₹{turf.base_price_per_hour}/hour
                </div>
                
                {turf.capacity && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Up to {turf.capacity} players
                  </div>
                )}
              </div>

              {turf.supported_sports.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Supported Sports</h4>
                  <div className="flex flex-wrap gap-2">
                    {turf.supported_sports.map((sport) => (
                      <Badge key={sport} variant="outline">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {turf.amenities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Book This Turf</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Player Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Player Information</h4>
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Name *</Label>
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playerPhone">Phone Number *</Label>
                    <Input
                      id="playerPhone"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playerEmail">Email (Optional)</Label>
                    <Input
                      id="playerEmail"
                      type="email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests..."
                    rows={3}
                  />
                </div>

                {/* Pricing Summary */}
                {pricing && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Booking Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{pricing.hours} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span>₹{pricing.baseAmount}</span>
                        </div>
                        {pricing.premiumCharges > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Premium Charges:</span>
                            <span>₹{pricing.premiumCharges}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>₹{pricing.totalAmount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {(onCancel || onBack) && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel || onBack}
                    >
                      {onBack ? 'Back' : 'Cancel'}
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createBooking.isPending || !pricing}
                  >
                    {createBooking.isPending ? 'Processing...' : 'Book Now'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
