
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Phone, Mail, User, MapPin } from 'lucide-react';
import { useOwnerBookings, useUpdateBooking, Booking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const BookingManagement = () => {
  const { data: bookings = [], isLoading } = useOwnerBookings();
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, status: newStatus });
      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You don't have any bookings yet." 
                : `No ${filter} bookings found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Booking Details */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.turfs?.name || 'Unknown Turf'}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.turfs?.area}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentBadge(booking.payment_status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        {format(new Date(booking.booking_date), 'PPP')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        {booking.start_time} - {booking.end_time}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {booking.player_name}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        {booking.player_phone}
                      </div>
                      {booking.player_email && (
                        <div className="flex items-center col-span-2">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {booking.player_email}
                        </div>
                      )}
                    </div>

                    {booking.special_requests && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                        <p className="text-sm">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment & Actions */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Payment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{booking.total_hours} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span>₹{booking.base_price}</span>
                        </div>
                        {booking.premium_charges > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Premium Charges:</span>
                            <span>₹{booking.premium_charges}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>₹{booking.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={updateBooking.isPending}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          disabled={updateBooking.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        disabled={updateBooking.isPending}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
