
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, DollarSign, MapPin } from 'lucide-react';
import { format, isAfter, isToday } from 'date-fns';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  turf: any;
  onBack: () => void;
  onSuccess: () => void;
}

const BookingForm = ({ turf, onBack, onSuccess }: BookingFormProps) => {
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

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const calculateAmount = () => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (hours <= 0) return 0;
    
    let baseAmount = hours * turf.base_price_per_hour;
    let premiumCharges = 0;
    
    // Weekend premium
    if (selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6)) {
      premiumCharges += baseAmount * (turf.weekend_premium_percentage || 0) / 100;
    }
    
    // Peak hours premium
    const isPeakHour = turf.peak_hours_start && turf.peak_hours_end &&
      startTime >= turf.peak_hours_start && endTime <= turf.peak_hours_end;
    
    if (isPeakHour) {
      premiumCharges += baseAmount * (turf.peak_hours_premium_percentage || 0) / 100;
    }
    
    return {
      hours,
      baseAmount,
      premiumCharges,
      totalAmount: baseAmount + premiumCharges
    };
  };

  const pricing = calculateAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !startTime || !endTime || !playerName || !playerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (pricing.hours <= 0) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time",
        variant: "destructive",
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
        title: "Booking Successful!",
        description: "Your booking has been submitted and is pending confirmation.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Book {turf.name}</h2>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {turf.area}
          </div>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
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
                          disabled={(date) => 
                            date < new Date() || 
                            (!isToday(date) && !isAfter(date, new Date()))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Start Time *</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Start" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>End Time *</Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="End" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requests or requirements..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createBooking.isPending || !pricing.totalAmount}
                >
                  {createBooking.isPending ? 'Creating Booking...' : 'Book Now'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{turf.name}</h4>
                <p className="text-sm text-muted-foreground">{turf.area}</p>
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, 'PPP')}
                  </div>
                  {startTime && endTime && (
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {startTime} - {endTime}
                    </div>
                  )}
                </div>
              )}

              {pricing.totalAmount > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Base Price ({pricing.hours}h)</span>
                    <span>₹{pricing.baseAmount.toFixed(2)}</span>
                  </div>
                  {pricing.premiumCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Premium Charges</span>
                      <span>₹{pricing.premiumCharges.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{pricing.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Booking is subject to availability</p>
                <p>• Payment can be made at the venue</p>
                <p>• Cancellation policy applies</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
