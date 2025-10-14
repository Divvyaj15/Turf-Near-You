import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface PendingTurf {
  id: string;
  name: string;
  description: string | null;
  location: string;
  owner_id: string;
  hourly_rate: number;
  sport_type: string | null;
  is_approved: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function AdminDashboard() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingTurfs, setPendingTurfs] = useState<PendingTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurf, setSelectedTurf] = useState<PendingTurf | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      fetchPendingTurfs();
    };

    checkAdminStatus();
  }, [user, navigate]);

  const fetchPendingTurfs = async () => {
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            email
          )
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingTurfs(data || []);
    } catch (error: any) {
      console.error('Error fetching pending turfs:', error);
      toast({
        title: "Error",
        description: "Failed to load pending turfs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (turfId: string, ownerId: string) => {
    setProcessingId(turfId);
    try {
      const { error } = await supabase.functions.invoke('approve-turf', {
        body: { turfId, ownerId, action: 'approve' }
      });

      if (error) throw error;

      toast({
        title: "Turf Approved",
        description: "The turf has been approved successfully"
      });

      // Refresh the list
      fetchPendingTurfs();
    } catch (error: any) {
      console.error('Error approving turf:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve turf",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejection = async () => {
    if (!selectedTurf) return;

    setProcessingId(selectedTurf.id);
    try {
      const { error } = await supabase.functions.invoke('approve-turf', {
        body: {
          turfId: selectedTurf.id,
          ownerId: selectedTurf.owner_id,
          action: 'reject',
          rejectionReason
        }
      });

      if (error) throw error;

      toast({
        title: "Turf Rejected",
        description: "The turf has been rejected"
      });

      setShowRejectDialog(false);
      setSelectedTurf(null);
      setRejectionReason('');
      fetchPendingTurfs();
    } catch (error: any) {
      console.error('Error rejecting turf:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject turf",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Pending Turf Approvals ({pendingTurfs.length})
        </h2>
      </div>

      {pendingTurfs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No pending turf approvals
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingTurfs.map((turf) => (
            <Card key={turf.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{turf.name}</CardTitle>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{turf.location}</p>
                </div>

                {turf.sport_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sport Type</p>
                    <p className="font-medium">{turf.sport_type}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium">₹{turf.hourly_rate}</p>
                </div>

                {turf.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm line-clamp-2">{turf.description}</p>
                  </div>
                )}

                {turf.profiles && (
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{turf.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">{turf.profiles.email}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(turf.id, turf.owner_id)}
                    disabled={processingId === turf.id}
                    className="flex-1"
                  >
                    {processingId === turf.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedTurf(turf);
                      setShowRejectDialog(true);
                    }}
                    disabled={processingId === turf.id}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Turf</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this turf. This will be sent to the owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectDialog(false);
              setSelectedTurf(null);
              setRejectionReason('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejection}
              disabled={!rejectionReason.trim() || processingId === selectedTurf?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processingId === selectedTurf?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Reject Turf
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
