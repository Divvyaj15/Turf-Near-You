import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Calendar as CalendarIcon, BarChart2, Settings, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Turf } from '@/hooks/useTurfs';
import { TurfSlotManagement } from '@/components/TurfSlotManagement';

interface TurfManagementProps {
  turfs: Turf[];
  onTurfUpdate: () => void;
}

const TurfManagement: React.FC<TurfManagementProps> = ({ turfs, onTurfUpdate }) => {
  const { toast } = useToast();
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingAvailability, setIsSettingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({
    startTime: '06:00',
    endTime: '22:00',
    maintenanceDays: [] as string[],
    blockedDates: [] as Date[]
  });

  const handleStatusChange = async (turfId: string, newActive: boolean) => {
    try {
      const { error } = await supabase
        .from('turfs')
        .update({ is_active: newActive })
        .eq('id', turfId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Turf status has been updated successfully.",
      });

      onTurfUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handlePriceUpdate = async (turfId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('turfs')
        .update({ hourly_rate: newPrice })
        .eq('id', turfId);

      if (error) throw error;

      toast({
        title: "Price Updated",
        description: "Turf pricing has been updated successfully.",
      });

      onTurfUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update price",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Your Turfs</h2>
        <Button onClick={() => onTurfUpdate()}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map((turf) => (
          <Card key={turf.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={turf.images?.[0] || '/placeholder-turf.jpg'}
                alt={turf.name}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  turf.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {turf.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{turf.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{turf.location}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="font-semibold">₹{turf.hourly_rate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sport Type</p>
                  <p className="font-semibold">{turf.sport_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amenities</p>
                  <p className="font-semibold">{turf.amenities?.length || 0} amenities</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Turf Details</DialogTitle>
                    </DialogHeader>
                    {/* Add edit form here */}
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Manage Slots
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Time Slots - {turf.name}</DialogTitle>
                    </DialogHeader>
                    <TurfSlotManagement turfId={turf.id} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Turf Analytics</DialogTitle>
                    </DialogHeader>
                    {/* Add analytics content here */}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TurfManagement; 