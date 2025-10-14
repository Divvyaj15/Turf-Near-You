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
import { useTurfSlots, TurfSlot } from '@/hooks/useTurfSlots';

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
  const { data: turfSlots = [] } = useTurfSlots(turf.id);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<TurfSlot | null>(null);
  const [bookingMode, setBookingMode] = useState<'hourly' | 'slot'>('slot');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    return turfSlots.filter(slot => slot.day_of_week === dayOfWeek && slot.is_available);
  };

  const calculatePricing = (): PricingResult | null => {
    if (bookingMode === 'slot') {
      if (!selectedSlot) return null;
      
      return {
        hours: selectedSlot.duration_minutes / 60,
        baseAmount: selectedSlot.price,
        premiumCharges: 0,
        totalAmount: selectedSlot.price
      };
    } else {
      // Hourly booking logic (existing)
      if (!selectedDate || !startTime || !endTime) return null;

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (end <= start) return null;

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const baseAmount = hours * turf.hourly_rate;
      
      let premiumCharges = 0;

      return {
        hours,
        baseAmount,
        premiumCharges,
        totalAmount: baseAmount + premiumCharges
      };
    }
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

    const bookingData: any = {
      turf_id: turf.id,
      user_id: user.id,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      total_hours: pricing.hours,
      base_price: pricing.baseAmount,
      premium_charges: pricing.premiumCharges,
      total_amount: pricing.totalAmount,
      player_name: playerName,
      player_phone: playerPhone,
      player_email: playerEmail || undefined,
      special_requests: specialRequests || undefined,
    };

    if (bookingMode === 'slot' && selectedSlot) {
      bookingData.slot_id = selectedSlot.id;
      bookingData.start_time = selectedSlot.start_time;
      bookingData.end_time = selectedSlot.end_time;
      bookingData.duration_minutes = selectedSlot.duration_minutes;
      bookingData.slot_price = selectedSlot.price_per_slot;
    } else {
      bookingData.start_time = startTime;
      bookingData.end_time = endTime;
    }

    try {
      await createBooking.mutateAsync(bookingData);

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
              {turf.images?.[0] && (
                <img
                  src={turf.images[0]}
                  alt={turf.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {turf.location}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ₹{turf.hourly_rate}/hour
                </div>
                
                {turf.sport_type && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {turf.sport_type}
                  </div>
                )}
              </div>

              {turf.amenities && turf.amenities.length > 0 && (
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
                {/* Booking Mode Selection */}
                <div className="space-y-2">
                  <Label>Booking Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={bookingMode === 'slot' ? 'default' : 'outline'}
                      onClick={() => {
                        setBookingMode('slot');
                        setSelectedSlot(null);
                      }}
                      className="flex-1"
                    >
                      Slot Booking
                    </Button>
                    <Button
                      type="button"
                      variant={bookingMode === 'hourly' ? 'default' : 'outline'}
                      onClick={() => {
                        setBookingMode('hourly');
                        setSelectedSlot(null);
                      }}
                      className="flex-1"
                    >
                      Hourly Booking
                    </Button>
                  </div>
                </div>

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
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Slot Selection (for slot booking mode) */}
                {bookingMode === 'slot' && selectedDate && (
                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {getAvailableSlots().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No slots available for selected date
                        </p>
                      ) : (
                        getAvailableSlots().map((slot) => (
                          <Button
                            key={slot.id}
                            type="button"
                            variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                            onClick={() => setSelectedSlot(slot)}
                            className="justify-between"
                          >
                            <span>
                              {slot.start_time} - {slot.end_time} ({slot.duration_minutes}min)
                            </span>
                            <span>₹{slot.price}</span>
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Time Selection (for hourly booking mode) */}
                {bookingMode === 'hourly' && (
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
                )}

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
