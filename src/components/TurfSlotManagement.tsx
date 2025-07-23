import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOwnerTurfSlots, useCreateTurfSlot, useUpdateTurfSlot, useDeleteTurfSlot } from '@/hooks/useTurfSlots';
import { Trash2, Plus, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TurfSlotManagementProps {
  turfId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

export const TurfSlotManagement: React.FC<TurfSlotManagementProps> = ({ turfId }) => {
  const { toast } = useToast();
  const { data: slots = [], isLoading } = useOwnerTurfSlots(turfId);
  const createSlot = useCreateTurfSlot();
  const updateSlot = useUpdateTurfSlot();
  const deleteSlot = useDeleteTurfSlot();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    duration_minutes: '',
    price_per_slot: '',
    is_available: true,
  });

  const resetForm = () => {
    setFormData({
      day_of_week: '',
      start_time: '',
      duration_minutes: '',
      price_per_slot: '',
      is_available: true,
    });
    setEditingSlot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day_of_week || !formData.start_time || !formData.duration_minutes || !formData.price_per_slot) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startTime = formData.start_time;
    const durationMinutes = parseInt(formData.duration_minutes);
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTimeMinutes = (hours * 60) + minutes + durationMinutes;
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    const slotData = {
      turf_id: turfId,
      day_of_week: parseInt(formData.day_of_week),
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      price_per_slot: parseFloat(formData.price_per_slot),
      is_available: formData.is_available,
    };

    try {
      if (editingSlot) {
        await updateSlot.mutateAsync({ id: editingSlot.id, ...slotData });
        toast({
          title: "Success",
          description: "Slot updated successfully",
        });
      } else {
        await createSlot.mutateAsync(slotData);
        toast({
          title: "Success",
          description: "Slot created successfully",
        });
      }
      
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save slot",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week.toString(),
      start_time: slot.start_time,
      duration_minutes: slot.duration_minutes.toString(),
      price_per_slot: slot.price_per_slot.toString(),
      is_available: slot.is_available,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (slotId: string) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await deleteSlot.mutateAsync(slotId);
        toast({
          title: "Success",
          description: "Slot deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete slot",
          variant: "destructive",
        });
      }
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || '';
  };

  if (isLoading) {
    return <div>Loading slots...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Time Slots Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="day_of_week">Day of Week</Label>
                  <Select value={formData.day_of_week} onValueChange={(value) => setFormData({...formData, day_of_week: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_minutes">Duration</Label>
                  <Select value={formData.duration_minutes} onValueChange={(value) => setFormData({...formData, duration_minutes: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price_per_slot">Price per Slot (₹)</Label>
                  <Input
                    id="price_per_slot"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_slot}
                    onChange={(e) => setFormData({...formData, price_per_slot: e.target.value})}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                  />
                  <Label htmlFor="is_available">Available for booking</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createSlot.isPending || updateSlot.isPending}>
                    {editingSlot ? 'Update' : 'Create'} Slot
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <p className="text-muted-foreground">No slots configured yet. Add your first slot to get started.</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {getDayName(slot.day_of_week)} - {slot.start_time} to {slot.end_time}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {slot.duration_minutes} minutes • ₹{slot.price_per_slot} • 
                    {slot.is_available ? ' Available' : ' Unavailable'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(slot)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(slot.id)}
                    disabled={deleteSlot.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};