
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Building, Users, Calendar, BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface PendingTurf {
  id: string;
  name: string;
  area: string;
  address: string;
  owner_id: string;
  status: string;
  created_at: string;
  base_price_per_hour: number;
  contact_phone: string;
  contact_email: string;
  turf_owners?: {
    business_name: string;
    owner_name: string;
  };
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingTurfs, setPendingTurfs] = useState<PendingTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTurfs: 0,
    pendingTurfs: 0,
    totalUsers: 0,
    totalBookings: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    if (user.email !== 'divvyavidhyutjain601@gmail.com') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      return;
    }

    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch pending turfs
      const { data: turfs, error: turfsError } = await supabase
        .from('turfs')
        .select(`
          *,
          turf_owners (
            business_name,
            owner_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (turfsError) throw turfsError;
      setPendingTurfs(turfs || []);

      // Fetch stats
      const [
        { count: totalTurfs },
        { count: pendingTurfsCount },
        { count: totalUsers },
        { count: totalBookings }
      ] = await Promise.all([
        supabase.from('turfs').select('*', { count: 'exact', head: true }),
        supabase.from('turfs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalTurfs: totalTurfs || 0,
        pendingTurfs: pendingTurfsCount || 0,
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0
      });

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTurfApproval = async (turfId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('approve-turf', {
        body: {
          turfId,
          action,
          reason
        }
      });

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Turf Approved" : "Turf Rejected",
        description: `Turf has been ${action}d successfully`,
      });

      fetchAdminData(); // Refresh data
    } catch (error: any) {
      console.error('Error processing turf:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} turf`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage turfs, users, and platform operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{stats.totalTurfs}</p>
              <p className="text-sm text-gray-600">Total Turfs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="w-8 h-8 text-yellow-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{stats.pendingTurfs}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending-turfs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending-turfs">Pending Turfs ({stats.pendingTurfs})</TabsTrigger>
          <TabsTrigger value="all-turfs">All Turfs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-turfs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Turf Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTurfs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending turfs for approval</p>
              ) : (
                <div className="space-y-4">
                  {pendingTurfs.map((turf) => (
                    <div key={turf.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{turf.name}</h3>
                          <p className="text-gray-600">{turf.area}</p>
                          <p className="text-sm text-gray-500">{turf.address}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span><strong>Price:</strong> ₹{turf.base_price_per_hour}/hr</span>
                            <span><strong>Contact:</strong> {turf.contact_phone}</span>
                          </div>
                          {turf.turf_owners && (
                            <div className="text-sm">
                              <span><strong>Business:</strong> {turf.turf_owners.business_name}</span>
                              <br />
                              <span><strong>Owner:</strong> {turf.turf_owners.owner_name}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleTurfApproval(turf.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleTurfApproval(turf.id, 'reject', 'Business verification failed')}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-turfs">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">All turfs management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">User management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
