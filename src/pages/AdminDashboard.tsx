import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, Building2, Mail, Phone, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface TurfOwnerWithTurfs {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string;
  business_type: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  verification_status: string;
  years_of_operation: number;
  created_at: string;
  turfs: Array<{
    id: string;
    name: string;
    address: string;
    status: string;
  }>;
}

interface PendingTurf {
  id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  contact_phone: string;
  contact_email: string;
  supported_sports: string[];
  amenities: string[];
  surface_type: string;
  capacity: number;
  base_price_per_hour: number;
  status: string;
  created_at: string;
  turf_owners: {
    id: string;
    business_name: string;
    owner_name: string;
    contact_phone: string;
  };
}

const AdminDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingOwners, setPendingOwners] = useState<TurfOwnerWithTurfs[]>([]);
  const [pendingTurfs, setPendingTurfs] = useState<PendingTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (userRole !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this page.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
    }
  }, [user, userRole, authLoading, navigate, toast]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchPendingData();
    }
  }, [userRole]);

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      
      // Fetch turf owners with pending verification status and their turfs
      const { data: owners, error: ownersError } = await supabase
        .from('turf_owners')
        .select(`
          id,
          user_id,
          business_name,
          owner_name,
          business_type,
          contact_phone,
          contact_email,
          address,
          verification_status,
          years_of_operation,
          created_at,
          turfs:turfs(id, name, address, status)
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (ownersError) {
        throw ownersError;
      }

      // Fetch turfs with pending_approval status from verified owners
      const { data: turfs, error: turfsError } = await supabase
        .from('turfs')
        .select(`
          id,
          name,
          description,
          address,
          area,
          contact_phone,
          contact_email,
          supported_sports,
          amenities,
          surface_type,
          capacity,
          base_price_per_hour,
          status,
          created_at,
          turf_owners:owner_id(
            id,
            business_name,
            owner_name,
            contact_phone
          )
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (turfsError) {
        throw turfsError;
      }

      setPendingOwners(owners || []);
      setPendingTurfs(turfs || []);
    } catch (error: any) {
      console.error('Error fetching pending data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (ownerId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingIds(prev => new Set(prev).add(ownerId));

      const owner = pendingOwners.find(o => o.id === ownerId);
      if (!owner) return;

      const { error } = await supabase.functions.invoke('approve-turf', {
        body: {
          turfId: owner.turfs[0]?.id, // Use first turf ID if available
          ownerId: ownerId,
          action: action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: action === 'approve' ? "Owner Approved" : "Owner Rejected",
        description: `${owner.business_name} has been ${action}d successfully.`,
      });

      // Remove from pending list
      setPendingOwners(prev => prev.filter(o => o.id !== ownerId));
      setRejectionReason("");

    } catch (error: any) {
      console.error(`Error ${action}ing owner:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} turf owner.`,
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(ownerId);
        return newSet;
      });
    }
  };

  const handleTurfApproval = async (turfId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingIds(prev => new Set(prev).add(turfId));

      const turf = pendingTurfs.find(t => t.id === turfId);
      if (!turf) return;

      const { error } = await supabase.functions.invoke('approve-turf', {
        body: {
          turfId: turfId,
          ownerId: turf.turf_owners.id,
          action: action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: action === 'approve' ? "Turf Approved" : "Turf Rejected",
        description: `${turf.name} has been ${action}d successfully.`,
      });

      // Remove from pending list
      setPendingTurfs(prev => prev.filter(t => t.id !== turfId));
      setRejectionReason("");

    } catch (error: any) {
      console.error(`Error ${action}ing turf:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} turf.`,
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(turfId);
        return newSet;
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Badge variant="secondary" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {pendingOwners.length} Pending Owners
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            {pendingTurfs.length} Pending Turfs
          </Badge>
        </div>
      </div>

      {/* Pending Turf Owners Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Turf Owner Applications</h2>
        {pendingOwners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-600 text-center">
                No pending turf owner applications at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingOwners.map((owner) => (
              <Card key={owner.id} className="border-l-4 border-l-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <span>{owner.business_name}</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Pending Review
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Owner:</span>
                        <span>{owner.owner_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span>{owner.contact_email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{owner.contact_phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Business Type:</span>
                        <p className="text-gray-600">{owner.business_type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Years of Operation:</span>
                        <p className="text-gray-600">{owner.years_of_operation} years</p>
                      </div>
                      <div>
                        <span className="font-medium">Applied on:</span>
                        <p className="text-gray-600">
                          {new Date(owner.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApproval(owner.id, 'approve')}
                      disabled={processingIds.has(owner.id)}
                      className="flex-1"
                    >
                      {processingIds.has(owner.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={processingIds.has(owner.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject {owner.business_name}'s application?
                            Please provide a reason for rejection.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRejectionReason("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleApproval(owner.id, 'reject')}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject Application
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Turfs Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Turf Approvals</h2>
        {pendingTurfs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-600 text-center">
                No pending turf approvals at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingTurfs.map((turf) => (
              <Card key={turf.id} className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <span>{turf.name}</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Pending Approval
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Business:</span>
                        <p className="text-gray-600">{turf.turf_owners.business_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-gray-600">{turf.turf_owners.owner_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Area:</span>
                        <p className="text-gray-600">{turf.area}</p>
                      </div>
                      <div>
                        <span className="font-medium">Surface Type:</span>
                        <p className="text-gray-600">{turf.surface_type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Capacity:</span>
                        <p className="text-gray-600">{turf.capacity} players</p>
                      </div>
                      <div>
                        <span className="font-medium">Base Price:</span>
                        <p className="text-gray-600">₹{turf.base_price_per_hour}/hour</p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p className="text-gray-600">{turf.contact_phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted on:</span>
                        <p className="text-gray-600">
                          {new Date(turf.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Supported Sports:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {turf.supported_sports.map((sport, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Address:</span>
                    <p className="text-gray-600">{turf.address}</p>
                  </div>

                  {turf.description && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600">{turf.description}</p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => handleTurfApproval(turf.id, 'approve')}
                      disabled={processingIds.has(turf.id)}
                      className="flex-1"
                    >
                      {processingIds.has(turf.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve Turf
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={processingIds.has(turf.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Turf
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Turf</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject {turf.name}?
                            Please provide a reason for rejection.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRejectionReason("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleTurfApproval(turf.id, 'reject')}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject Turf
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;