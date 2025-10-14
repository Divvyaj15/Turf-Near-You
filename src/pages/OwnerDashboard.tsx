import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import AddTurfForm from '@/components/AddTurfForm';
import TurfManagement from '@/components/TurfManagement';
import BookingManagement from '@/components/BookingManagement';
import { useOwnerTurfs } from '@/hooks/useTurfs';

const OwnerDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [showAddTurf, setShowAddTurf] = useState(false);
  
  const { data: turfs = [], refetch: refetchTurfs } = useOwnerTurfs();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'owner' && userRole !== 'turf_owner') {
      navigate('/');
      return;
    }
  }, [user, userRole, navigate]);

  const handleTurfAdded = () => {
    setShowAddTurf(false);
    refetchTurfs();
  };

  if (showAddTurf) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowAddTurf(false)}>
            ← Back to Dashboard
          </Button>
        </div>
        <AddTurfForm onSuccess={handleTurfAdded} onBack={() => setShowAddTurf(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Turf Owner Dashboard</h1>
        <Button onClick={() => setShowAddTurf(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Turf
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Turfs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{turfs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Turfs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {turfs.filter(t => t.is_active).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved Turfs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {turfs.filter(t => t.is_approved).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {turfs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You haven't added any turfs yet</p>
            <Button onClick={() => setShowAddTurf(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Turf
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-8">
            <TurfManagement turfs={turfs} onTurfUpdate={refetchTurfs} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Booking Management</h2>
            <BookingManagement />
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
