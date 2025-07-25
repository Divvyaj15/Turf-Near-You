import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building, Users, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import AddTurfForm from '@/components/AddTurfForm';
import TurfManagement from '@/components/TurfManagement';
import BookingManagement from '@/components/BookingManagement';
import OwnerRegistrationForm from '@/components/OwnerRegistrationForm';
import { TurfSlotManagement } from '@/components/TurfSlotManagement';
import { useTurfs } from '@/hooks/useTurfs';

interface TurfOwnerData {
  id: string;
  business_name: string;
  address: string;
  contact_phone: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  business_type?: string;
  contact_email?: string;
  owner_name?: string;
  updated_at?: string;
  user_id: string;
  years_of_operation?: number;
}

const OwnerDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddTurf, setShowAddTurf] = useState(false);
  const [showOwnerRegistration, setShowOwnerRegistration] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedTurfForSchedule, setSelectedTurfForSchedule] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<TurfOwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the turfs hook to get turfs data
  const { data: turfs = [], refetch: refetchTurfs } = useTurfs();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'turf_owner') {
      navigate('/');
      return;
    }

    fetchOwnerData();
  }, [user, userRole, navigate]);

  const fetchOwnerData = async () => {
    if (!user) return;

    try {
      console.log('Fetching owner data for user:', user.id);
      
      const { data, error } = await supabase
        .from('turf_owners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Owner data query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching owner data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch owner data",
          variant: "destructive"
        });
        return;
      }

      // Type assertion to ensure verification_status matches our interface
      if (data) {
        const ownerDataWithTypedStatus = {
          ...data,
          verification_status: data.verification_status as 'pending' | 'verified' | 'rejected'
        };
        console.log('Setting owner data:', ownerDataWithTypedStatus);
        setOwnerData(ownerDataWithTypedStatus);
      } else {
        console.log('No owner data found for user');
        setOwnerData(null);
      }
    } catch (error) {
      console.error('Error in fetchOwnerData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleTurfUpdate = () => {
    refetchTurfs();
  };

  const handleCloseAddTurf = () => {
    setShowAddTurf(false);
    refetchTurfs(); // Refresh turfs when closing the form
  };

  const handleAddTurfSuccess = () => {
    setShowAddTurf(false);
    refetchTurfs();
    toast({
      title: "Success",
      description: "Turf has been submitted successfully!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleOwnerRegistrationComplete = async (ownerFormData: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use upsert to handle existing records
      const { error } = await supabase
        .from('turf_owners')
        .upsert({
          user_id: user.id,
          business_name: ownerFormData.businessName,
          owner_name: ownerFormData.ownerName,
          business_type: ownerFormData.businessType,
          contact_phone: ownerFormData.contactPhone,
          contact_email: ownerFormData.contactEmail,
          address: ownerFormData.address,
          years_of_operation: ownerFormData.yearsOfOperation[0],
          verification_status: 'pending' // Reset status when updating
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Registration Submitted!",
        description: "Your turf owner application has been submitted for review. You'll receive an email within 24-48 hours.",
      });

      setShowOwnerRegistration(false);
      fetchOwnerData(); // Refresh the data
    } catch (error: any) {
      console.error('Owner registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ownerData) {
    if (showOwnerRegistration) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <OwnerRegistrationForm
            onBack={() => setShowOwnerRegistration(false)}
            onComplete={handleOwnerRegistrationComplete}
          />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Owner Profile Found</h2>
            <p className="text-gray-500 text-center mb-6">
              It looks like you haven't completed your turf owner registration yet.
            </p>
            <Button onClick={() => setShowOwnerRegistration(true)} className="cricket-gradient text-white">
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ownerData.verification_status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-gray-700">Application Under Review</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Thank you for submitting your turf owner application. Our team is currently reviewing your submission.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-yellow-800 mb-1">What happens next?</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Our team will verify your business details</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• After approval, you can start adding and managing turfs</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This process typically takes 1-2 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ownerData.verification_status === 'rejected') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-gray-700">Application Rejected</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Unfortunately, your turf owner application has been rejected.
            </p>
            {ownerData.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-2">Rejection Reason:</h4>
                <p className="text-sm text-red-700">{ownerData.rejection_reason}</p>
              </div>
            )}
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} className="cricket-gradient text-white">
                Submit New Application
              </Button>
              <p className="text-sm text-gray-500">
                Please ensure all information is accurate and complete when resubmitting.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verified owner dashboard
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600">Manage your turfs and bookings</p>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusIcon(ownerData.verification_status)}
          {getStatusBadge(ownerData.verification_status)}
        </div>
      </div>

      {/* Owner Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Business Name</label>
              <p className="text-lg font-semibold">{ownerData.business_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="text-lg">{ownerData.contact_phone}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Business Address</label>
              <p className="text-lg">{ownerData.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAddTurf(true)}>
          <CardContent className="flex items-center p-6">
            <Plus className="w-8 h-8 text-primary mr-4" />
            <div>
              <h3 className="font-semibold">Add New Turf</h3>
              <p className="text-sm text-gray-600">List a new turf for booking</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-semibold">Manage Bookings</h3>
              <p className="text-sm text-gray-600">View and manage reservations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowSchedule(true)}>
          <CardContent className="flex items-center p-6">
            <Calendar className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <h3 className="font-semibold">Schedule</h3>
              <p className="text-sm text-gray-600">Set availability and pricing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turf Management */}
      <TurfManagement turfs={turfs} onTurfUpdate={handleTurfUpdate} />

      {/* Booking Management */}
      <BookingManagement />

      {/* Add Turf Modal */}
      {showAddTurf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Turf</h2>
                <Button variant="ghost" onClick={handleCloseAddTurf}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <AddTurfForm 
                onBack={handleCloseAddTurf}
                onSuccess={handleAddTurfSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Management Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule Management</h2>
                <Button variant="ghost" onClick={() => setShowSchedule(false)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              {!selectedTurfForSchedule ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Select a turf to manage its schedule:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {turfs.map((turf) => (
                      <Card key={turf.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTurfForSchedule(turf)}>
                        <CardContent className="p-4">
                          <div className="aspect-video relative mb-3">
                            <img
                              src={turf.cover_image_url || '/placeholder-turf.jpg'}
                              alt={turf.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <h3 className="font-semibold">{turf.name}</h3>
                          <p className="text-sm text-muted-foreground">{turf.area}</p>
                          <p className="text-sm font-medium">₹{turf.base_price_per_hour}/hr base</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {turfs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No turfs available. Add a turf first to manage schedules.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Managing Schedule for: {selectedTurfForSchedule.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTurfForSchedule.area}</p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedTurfForSchedule(null)}>
                      ← Back to Turf Selection
                    </Button>
                  </div>
                  <TurfSlotManagement turfId={selectedTurfForSchedule.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
