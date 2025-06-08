
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Phone, Mail, MapPin } from 'lucide-react';
import { useOwnerBookings, useUpdateBooking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const BookingManagement = () => {
  const { data: bookings = [], isLoading } = useOwnerBookings();
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, status });
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{booking.turfs?.name}</CardTitle>
                {getStatusBadge(booking.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(booking.booking_date), 'PPP')}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {booking.start_time} - {booking.end_time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {booking.turfs?.area}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    {booking.player_name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.player_phone}
                  </div>
                  {booking.player_email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {booking.player_email}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount: ₹{booking.total_amount}</span>
                  <span className="text-sm text-muted-foreground">
                    {booking.total_hours} hours
                  </span>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Special Requests:</strong> {booking.special_requests}
                  </p>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    disabled={updateBooking.isPending}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    disabled={updateBooking.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    disabled={updateBooking.isPending}
                  >
                    Mark Completed
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Bookings Found</h4>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No ${filter} bookings found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
