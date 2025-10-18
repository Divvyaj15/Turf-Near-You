import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, DollarSign, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TurfSlotManagement } from "@/components/TurfSlotManagement";
import BookingManagement from "@/components/BookingManagement";
import { useToast } from "@/hooks/use-toast";
import { Turf } from "@/hooks/useTurfs";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [ownedTurfs, setOwnedTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        // Auto-select first turf or the one from URL
        const urlTurfId = searchParams.get('turf_id');
        const turfToSelect = urlTurfId 
          ? data.find(t => t.id === urlTurfId) || data[0]
          : data[0];
        setSelectedTurf(turfToSelect as Turf);
      } else {
        toast({
          title: "No turfs found",
          description: "You haven't claimed any turfs yet. Please claim a turf from your profile.",
          variant: "destructive"
        });
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
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your turfs...</p>
        </div>
      </div>
    );
  }

  // If no turfs owned, show message
  if (ownedTurfs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Turfs Found</CardTitle>
            <CardDescription>
              You haven't claimed any turfs yet. Visit your profile to claim a turf.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/my-profile')} className="w-full">
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + Number(b.total_price), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTurf?.name || 'Turf'} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your turf, slots, and bookings
          </p>
        </div>
        <div className="flex items-center gap-4">
          {ownedTurfs.length > 1 && (
            <select
              value={selectedTurf?.id}
              onChange={(e) => {
                const turf = ownedTurfs.find(t => t.id === e.target.value);
                if (turf) setSelectedTurf(turf);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {ownedTurfs.map(turf => (
                <option key={turf.id} value={turf.id}>
                  {turf.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={selectedTurf?.is_approved ? "default" : "secondary"}>
              {selectedTurf?.is_approved ? 'Approved' : 'Pending'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Management */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="slots">Slot Management</TabsTrigger>
          <TabsTrigger value="details">Turf Details</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>View and manage your turf bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slot Management</CardTitle>
              <CardDescription>Configure available time slots for your turf</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTurf && <TurfSlotManagement turfId={selectedTurf.id} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Turf Information</CardTitle>
              <CardDescription>Your turf details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedTurf?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedTurf?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sport Type</p>
                  <p className="font-medium">{selectedTurf?.sport_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Surface Type</p>
                  <p className="font-medium">{selectedTurf?.surface_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium">₹{selectedTurf?.hourly_rate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{selectedTurf?.size || 'N/A'}</p>
                </div>
              </div>
              {selectedTurf?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{selectedTurf.description}</p>
                </div>
              )}
              {selectedTurf?.amenities && selectedTurf.amenities.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTurf.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerDashboard;
