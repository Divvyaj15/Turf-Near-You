
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, LogOut, Search, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import TurfSearch from '@/components/TurfSearch';
import BookingForm from '@/components/BookingForm';
import ReviewSystem from '@/components/ReviewSystem';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bookings = [] } = useBookings();
  
  const [currentView, setCurrentView] = useState<'search' | 'booking' | 'mybookings'>('search');
  const [selectedTurf, setSelectedTurf] = useState<any>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
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

  const recentBookings = bookings.slice(0, 3);
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.booking_date) >= new Date()
  ).length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  if (currentView === 'booking' && selectedTurf) {
    return (
      <BookingForm
        turf={selectedTurf}
        onBack={() => {
          setCurrentView('search');
          setSelectedTurf(null);
        }}
        onSuccess={() => {
          setCurrentView('mybookings');
          setSelectedTurf(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TurfConnect</h1>
              <p className="text-sm text-muted-foreground">Find & Book Sports Turfs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={currentView === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('search')}
              >
                <Search className="w-4 h-4 mr-2" />
                Search Turfs
              </Button>
              <Button
                variant={currentView === 'mybookings' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('mybookings')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="container mx-auto px-4 py-2 flex space-x-2">
          <Button
            variant={currentView === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('search')}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant={currentView === 'mybookings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('mybookings')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Bookings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'search' && (
          <>
            {/* Dashboard Stats */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold">{bookings.length}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                        <p className="text-2xl font-bold">{upcomingBookings}</p>
                      </div>
                      <Clock className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{completedBookings}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Bookings */}
            {recentBookings.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Recent Bookings</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentView('mybookings')}
                  >
                    View All
                  </Button>
                </div>
                <div className="grid gap-4">
                  {recentBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{booking.turfs?.name}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {booking.turfs?.area}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(booking.booking_date), 'PPP')}
                              <Clock className="w-4 h-4 ml-3 mr-1" />
                              {booking.start_time} - {booking.end_time}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(booking.status)}
                            <div className="text-sm font-medium mt-1">
                              ₹{booking.total_amount}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <TurfSearch onTurfSelect={(turf) => {
              setSelectedTurf(turf);
              setCurrentView('booking');
            }} />
          </>
        )}

        {currentView === 'mybookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button onClick={() => setCurrentView('search')}>
                <Search className="w-4 h-4 mr-2" />
                Book New Turf
              </Button>
            </div>

            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{booking.turfs?.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.turfs?.area}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(booking.booking_date), 'PPP')}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {booking.start_time} - {booking.end_time}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <div className="text-lg font-semibold mt-1">
                          ₹{booking.total_amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.total_hours} hours
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div><strong>Player:</strong> {booking.player_name}</div>
                      <div><strong>Phone:</strong> {booking.player_phone}</div>
                      {booking.player_email && (
                        <div><strong>Email:</strong> {booking.player_email}</div>
                      )}
                      {booking.special_requests && (
                        <div><strong>Special Requests:</strong> {booking.special_requests}</div>
                      )}
                    </div>

                    {booking.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t">
                        <ReviewSystem
                          turfId={booking.turf_id}
                          bookingId={booking.id}
                          canReview={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {bookings.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Bookings Yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start by booking your first turf!
                    </p>
                    <Button onClick={() => setCurrentView('search')}>
                      <Search className="w-4 h-4 mr-2" />
                      Find Turfs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
