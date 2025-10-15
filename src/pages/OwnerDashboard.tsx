import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, DollarSign, Calendar, Users, Lock } from "lucide-react";
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
  
  const [turfId, setTurfId] = useState(searchParams.get('turf_id') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [turf, setTurf] = useState<Turf | null>(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyTurfId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turfId.trim()) {
      toast({
        title: "Turf ID required",
        description: "Please enter your turf unique ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('id', turfId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Invalid Turf ID",
          description: "No turf found with this ID. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      setTurf(data as Turf);
      setIsAuthorized(true);
      
      // Update URL with turf_id
      navigate(`/owner-dashboard?turf_id=${turfId}`, { replace: true });
      
      toast({
        title: "Access granted!",
        description: `Welcome to ${data.name} dashboard`,
      });
    } catch (error: any) {
      console.error('Error verifying turf ID:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify turf ID",
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

    // Auto-verify if turf_id is in URL
    const urlTurfId = searchParams.get('turf_id');
    if (urlTurfId && !isAuthorized) {
      setTurfId(urlTurfId);
      // Trigger verification
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }, 100);
    }
  }, [user, navigate, searchParams, isAuthorized]);

  useEffect(() => {
    if (isAuthorized && turf) {
      fetchBookings();
    }
  }, [isAuthorized, turf]);

  const fetchBookings = async () => {
    if (!turf) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('turf_id', turf.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  // If not authorized, show turf ID input
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Owner Dashboard Access</CardTitle>
            <CardDescription>
              Enter your unique turf ID to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyTurfId} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="turfId">Turf Unique ID</Label>
                <Input
                  id="turfId"
                  placeholder="Enter your turf ID"
                  value={turfId}
                  onChange={(e) => setTurfId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your turf ID was provided to you by the administrator
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>
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
            {turf?.name || 'Turf'} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your turf, slots, and bookings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Turf ID: {turfId}
        </Badge>
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
            <Badge variant={turf?.is_approved ? "default" : "secondary"}>
              {turf?.is_approved ? 'Approved' : 'Pending'}
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
              {turf && <TurfSlotManagement turfId={turf.id} />}
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
                  <p className="font-medium">{turf?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{turf?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sport Type</p>
                  <p className="font-medium">{turf?.sport_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Surface Type</p>
                  <p className="font-medium">{turf?.surface_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium">₹{turf?.hourly_rate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{turf?.size || 'N/A'}</p>
                </div>
              </div>
              {turf?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{turf.description}</p>
                </div>
              )}
              {turf?.amenities && turf.amenities.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities.map((amenity, index) => (
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
