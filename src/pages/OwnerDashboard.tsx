import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Calendar, DollarSign, Star, Settings, LogOut, Plus, MapPin, Users, BarChart2, Clock, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddTurfForm from '@/components/AddTurfForm';
import BookingManagement from '@/components/BookingManagement';
import TurfManagement from '@/components/TurfManagement';
import { useOwnerTurfs } from '@/hooks/useTurfs';
import { useOwnerBookings } from '@/hooks/useBookings';

interface TurfOwnerData {
  id: string;
  business_name: string;
  owner_name: string;
  verification_status: string;
  business_type: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  years_of_operation: number;
}

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ownerData, setOwnerData] = useState<TurfOwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'addturf' | 'bookings' | 'turfs'>('dashboard');
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  
  const { data: turfs = [], refetch: refetchTurfs } = useOwnerTurfs();
  const { data: bookings = [] } = useOwnerBookings();

  // Calculate stats
  const todayBookings = bookings.filter(b => 
    new Date(b.booking_date).toDateString() === new Date().toDateString()
  ).length;
  
  const thisMonthRevenue = bookings
    .filter(b => {
      const bookingDate = new Date(b.booking_date);
      const now = new Date();
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.status === 'completed';
    })
    .reduce((sum, b) => sum + b.total_amount, 0);

  const totalTurfs = turfs.length;
  const activeTurfs = turfs.filter(t => t.status === 'active').length;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchOwnerData();
  }, [user, navigate]);

  const fetchOwnerData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('turf_owners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching owner data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        // No owner data found, show registration prompt
        setShowRegistrationPrompt(true);
      } else {
        setOwnerData(data);
        setShowRegistrationPrompt(false);
      }
    } catch (error: any) {
      console.error('Error fetching owner data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTurfSuccess = () => {
    setCurrentView('dashboard');
    refetchTurfs();
    fetchOwnerData(); // Refresh owner data
    toast({
      title: "Success!",
      description: "Your turf has been added successfully.",
    });
  };

  const handleOwnerRegistrationStart = () => {
    setShowRegistrationPrompt(false);
    setCurrentView('addturf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'addturf') {
    return (
      <AddTurfForm 
        onBack={() => setCurrentView('dashboard')}
        onSuccess={handleAddTurfSuccess}
      />
    );
  }

  // Show registration prompt for new turf owners
  if (showRegistrationPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Welcome to Turf Owner Dashboard!</h2>
            <p className="text-muted-foreground mb-6">
              Ready to register your turf? Your submission will be reviewed and you'll be notified once approved.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleOwnerRegistrationStart}
                className="w-full"
                size="lg"
              >
                Yes, I want to register my turf
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                No, take me back to home
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Your turf will be reviewed by our admin team before going live.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Registration</h3>
            <p className="text-muted-foreground mb-4">
              You need to complete your turf owner registration to access the dashboard.
            </p>
            <Button onClick={handleOwnerRegistrationStart} className="w-full">
              Register as Turf Owner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval message if owner is not verified
  if (ownerData.verification_status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Approval Pending</h2>
            <p className="text-muted-foreground mb-6">
              Your turf submission is under review. We'll notify you once it's approved and your dashboard will be activated.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>What's next?</strong><br/>
                Our team is reviewing your submission. This usually takes 1-2 business days.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show rejection message if owner was rejected
  if (ownerData.verification_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <X className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Application Rejected</h2>
            <p className="text-muted-foreground mb-6">
              Unfortunately, your turf application was not approved.
            </p>
            {ownerData.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Reason:</strong><br/>
                  {ownerData.rejection_reason}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <Button onClick={handleOwnerRegistrationStart} className="w-full">
                Submit New Application
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TurfConnect Owner Portal</h1>
              <p className="text-sm text-muted-foreground">{ownerData.business_name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {getVerificationBadge(ownerData.verification_status)}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === 'turfs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('turfs')}
              >
                My Turfs
              </Button>
              <Button
                variant={currentView === 'bookings' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('bookings')}
              >
                Bookings
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
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
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
          <Button
            variant={currentView === 'turfs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('turfs')}
            className="flex-1"
          >
            My Turfs
          </Button>
          <Button
            variant={currentView === 'bookings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('bookings')}
            className="flex-1"
          >
            Bookings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {ownerData.owner_name}!</h2>
              <p className="text-muted-foreground">
                Manage your turfs, bookings, and grow your business with TurfConnect.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Bookings</p>
                      <p className="text-2xl font-bold">{todayBookings}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month's Revenue</p>
                      <p className="text-2xl font-bold">₹{thisMonthRevenue}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Turfs</p>
                      <p className="text-2xl font-bold">{activeTurfs}/{totalTurfs}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4"
                      onClick={() => setCurrentView('addturf')}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Turf
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4"
                      onClick={() => setCurrentView('bookings')}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      View Bookings
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4"
                      onClick={() => setCurrentView('turfs')}
                    >
                      <Building2 className="w-5 h-5 mr-2" />
                      Manage Turfs
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4"
                    >
                      <BarChart2 className="w-5 h-5 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.player_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === 'turfs' && (
          <TurfManagement turfs={turfs} onTurfUpdate={refetchTurfs} />
        )}

        {currentView === 'bookings' && (
          <BookingManagement />
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
