
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, DollarSign, Star, Settings, LogOut, Plus, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddTurfForm from '@/components/AddTurfForm';
import BookingManagement from '@/components/BookingManagement';
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'addturf' | 'bookings'>('dashboard');
  
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchOwnerData();
  }, [user, navigate]);

  const fetchOwnerData = async () => {
    try {
      const { data, error } = await supabase
        .from('turf_owners')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setOwnerData(data);
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
    await signOut();
    navigate('/');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleAddTurfSuccess = () => {
    setCurrentView('dashboard');
    refetchTurfs();
    toast({
      title: "Success!",
      description: "Your turf has been added successfully.",
    });
  };

  if (currentView === 'addturf') {
    return (
      <AddTurfForm 
        onBack={() => setCurrentView('dashboard')}
        onSuccess={handleAddTurfSuccess}
      />
    );
  }

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
            <Button onClick={() => navigate('/auth')} className="w-full">
              Complete Registration
            </Button>
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
                      <p className="text-2xl font-bold">{turfs.length}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Turfs Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">My Turfs</h3>
                <Button onClick={() => setCurrentView('addturf')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Turf
                </Button>
              </div>

              {turfs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {turfs.map((turf) => (
                    <Card key={turf.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {turf.cover_image_url && (
                          <img
                            src={turf.cover_image_url}
                            alt={turf.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h4 className="font-semibold text-lg mb-2">{turf.name}</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {turf.area}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            ₹{turf.base_price_per_hour}/hour
                          </div>
                          {turf.capacity && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Up to {turf.capacity} players
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {turf.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                          {turf.supported_sports.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {turf.supported_sports[0]}
                              {turf.supported_sports.length > 1 && ` +${turf.supported_sports.length - 1}`}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Turfs Added Yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first turf to begin accepting bookings
                    </p>
                    <Button onClick={() => setCurrentView('addturf')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Turf
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView('addturf')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-primary" />
                    Add New Turf
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Register a new turf to start accepting bookings
                  </p>
                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView('bookings')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Manage Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    View and manage your turf bookings
                  </p>
                  <Button variant="outline" className="w-full">View Bookings</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                    Financial Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Track your earnings and financial performance
                  </p>
                  <Button variant="outline" className="w-full">View Reports</Button>
                </CardContent>
              </Card>
            </div>

            {/* Business Information */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Business Type</p>
                    <p className="font-medium capitalize">{ownerData.business_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact Phone</p>
                    <p className="font-medium">{ownerData.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact Email</p>
                    <p className="font-medium">{ownerData.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Years of Operation</p>
                    <p className="font-medium">{ownerData.years_of_operation} years</p>
                  </div>
                  {ownerData.address && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{ownerData.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'bookings' && <BookingManagement />}
      </main>
    </div>
  );
};

export default OwnerDashboard;
