import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, DollarSign, Calendar, Users, Clock, TrendingUp, Settings, Plus, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TurfSlotManagement } from "@/components/TurfSlotManagement";
import BookingManagement from "@/components/BookingManagement";
import { useToast } from "@/hooks/use-toast";
import { Turf } from "@/hooks/useTurfs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [ownedTurfs, setOwnedTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  const fetchOwnerTurfs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOwnedTurfs(data as Turf[]);
        const urlTurfId = searchParams.get('turf_id');
        const turfToSelect = urlTurfId 
          ? data.find(t => t.id === urlTurfId) || data[0]
          : data[0];
        setSelectedTurf(turfToSelect as Turf);
      } else {
        setOwnedTurfs([]);
        setSelectedTurf(null);
      }
    } catch (error: any) {
      console.error('Error fetching owner turfs:', error);
      toast({
        title: "Error",
        description: "Failed to load your turfs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchOwnerTurfs();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedTurf) {
      fetchBookings();
    }
  }, [selectedTurf]);

  const fetchBookings = async () => {
    if (!selectedTurf) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('turf_id', selectedTurf.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      const allBookings = data || [];
      setBookings(allBookings);
      
      // Filter today's bookings
      const today = new Date().toISOString().split('T')[0];
      setTodayBookings(allBookings.filter(b => b.booking_date === today));
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no turfs owned, redirect to profile to claim
  if (ownedTurfs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Turfs Found</CardTitle>
            <CardDescription className="text-base">
              You haven't claimed any turfs yet. Go to your profile to claim a turf using your unique Turf ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => navigate('/my-profile')} className="w-full" size="lg">
              Go to My Profile
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats calculations
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + Number(b.total_price), 0);
  const pendingRevenue = bookings
    .filter((b: any) => b.payment_status === 'pending')
    .reduce((sum: number, b: any) => sum + Number(b.total_price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Owner Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your turf, slots, and bookings
            </p>
          </div>
          
          {/* Turf Selector */}
          {ownedTurfs.length > 1 && (
            <Select
              value={selectedTurf?.id}
              onValueChange={(value) => {
                const turf = ownedTurfs.find(t => t.id === value);
                if (turf) setSelectedTurf(turf);
              }}
            >
              <SelectTrigger className="w-[250px] bg-white">
                <SelectValue placeholder="Select turf" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {ownedTurfs.map(turf => (
                  <SelectItem key={turf.id} value={turf.id}>
                    {turf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Current Turf Info Card */}
        <Card className="bg-white shadow-md border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedTurf?.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{selectedTurf?.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={selectedTurf?.is_approved ? "default" : "secondary"} className="text-sm py-1">
                  {selectedTurf?.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
                </Badge>
                <Badge variant={selectedTurf?.is_active ? "default" : "outline"} className="text-sm py-1">
                  {selectedTurf?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Schedule</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Bookings today</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Users className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +₹{pendingRevenue.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add Slot</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">View Calendar</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50">
            <Star className="h-5 w-5" />
            <span className="text-xs">Reviews</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-gray-50">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>

        {/* Tabs for Management */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="slots">Time Slots</TabsTrigger>
            <TabsTrigger value="details">Turf Details</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Management
                </CardTitle>
                <CardDescription>View and manage all bookings for your turf</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground">
                      When customers book your turf, their bookings will appear here.
                    </p>
                  </div>
                ) : (
                  <BookingManagement />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Slot Management
                </CardTitle>
                <CardDescription>Configure available time slots and pricing for your turf</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTurf && <TurfSlotManagement turfId={selectedTurf.id} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Turf Information
                </CardTitle>
                <CardDescription>View and manage your turf details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-lg">{selectedTurf?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedTurf?.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedTurf?.address || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sport Type</p>
                    <p className="font-medium">{selectedTurf?.sport_type || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Surface Type</p>
                    <p className="font-medium">{selectedTurf?.surface_type || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium text-lg text-green-600">₹{selectedTurf?.hourly_rate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{selectedTurf?.size || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Turf ID</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">{selectedTurf?.id}</p>
                  </div>
                </div>
                
                {selectedTurf?.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{selectedTurf.description}</p>
                  </div>
                )}
                
                {selectedTurf?.amenities && selectedTurf.amenities.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTurf.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="py-1 px-3">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;