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

  const handleStatusChange = async (turfId: string, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      const { error } = await supabase
        .from('turfs')
        .update({ status: newStatus })
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
        .update({ base_price_per_hour: newPrice })
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

  const handleAvailabilityUpdate = async (turfId: string) => {
    try {
      const { error } = await supabase
        .from('turfs')
        .update({
          peak_hours_start: availabilityData.startTime,
          peak_hours_end: availabilityData.endTime,
          // Add maintenance days and blocked dates to a separate table if needed
        })
        .eq('id', turfId);

      if (error) throw error;

      toast({
        title: "Availability Updated",
        description: "Turf availability has been updated successfully.",
      });

      setIsSettingAvailability(false);
      onTurfUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
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
                src={turf.cover_image_url || '/placeholder-turf.jpg'}
                alt={turf.name}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  turf.status === 'active'
                    ? 'bg-green-500'
                    : turf.status === 'maintenance'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              >
                {turf.status || 'inactive'}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{turf.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{turf.address}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-semibold">₹{turf.base_price_per_hour}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sports</p>
                  <p className="font-semibold">{turf.supported_sports.length} sports</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amenities</p>
                  <p className="font-semibold">{turf.amenities.length} amenities</p>
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
                      Availability
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Availability</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={availabilityData.startTime}
                            onChange={(e) =>
                              setAvailabilityData((prev) => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={availabilityData.endTime}
                            onChange={(e) =>
                              setAvailabilityData((prev) => ({
                                ...prev,
                                endTime: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Maintenance Days</Label>
                        <Select
                          value={availabilityData.maintenanceDays.join(',')}
                          onValueChange={(value) =>
                            setAvailabilityData((prev) => ({
                              ...prev,
                              maintenanceDays: value.split(','),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select maintenance days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleAvailabilityUpdate(turf.id)}
                      >
                        Save Availability
                      </Button>
                    </div>
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