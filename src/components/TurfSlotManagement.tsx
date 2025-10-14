import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOwnerTurfSlots, useCreateTurfSlot, useUpdateTurfSlot, useDeleteTurfSlot } from '@/hooks/useTurfSlots';
import { Trash2, Plus, Edit, Clock, Calendar, DollarSign, Zap, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TurfSlotManagementProps {
  turfId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 min', icon: Clock },
  { value: 60, label: '1 hour', icon: Clock },
];

const QUICK_PRESETS = [
  {
    name: "Morning Hours",
    slots: [
      { start: "06:00", duration: 60 },
      { start: "07:00", duration: 60 },
      { start: "08:00", duration: 60 },
      { start: "09:00", duration: 60 },
      { start: "10:00", duration: 60 },
      { start: "11:00", duration: 60 },
    ]
  },
  {
    name: "Evening Rush",
    slots: [
      { start: "17:00", duration: 60 },
      { start: "18:00", duration: 60 },
      { start: "19:00", duration: 60 },
      { start: "20:00", duration: 60 },
      { start: "21:00", duration: 60 },
      { start: "22:00", duration: 60 },
    ]
  },
  {
    name: "30-Min Quick Games",
    slots: [
      { start: "18:00", duration: 30 },
      { start: "18:30", duration: 30 },
      { start: "19:00", duration: 30 },
      { start: "19:30", duration: 30 },
      { start: "20:00", duration: 30 },
      { start: "20:30", duration: 30 },
    ]
  }
];

export const TurfSlotManagement: React.FC<TurfSlotManagementProps> = ({ turfId }) => {
  const { toast } = useToast();
  const { data: slots = [], isLoading } = useOwnerTurfSlots(turfId);
  const createSlot = useCreateTurfSlot();
  const updateSlot = useUpdateTurfSlot();
  const deleteSlot = useDeleteTurfSlot();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [bulkData, setBulkData] = useState({
    selectedDays: [] as number[],
    defaultPrice: '',
    duration: '',
  });
  
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

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTimeMinutes = (hours * 60) + minutes + durationMinutes;
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleQuickPreset = async (preset: any) => {
    if (!bulkData.selectedDays.length || !bulkData.defaultPrice) {
      toast({
        title: "Setup Required",
        description: "Please select days and set a default price first",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = [];
      for (const day of bulkData.selectedDays) {
        for (const slot of preset.slots) {
          const slotData = {
            turf_id: turfId,
            day_of_week: day,
            start_time: slot.start,
            end_time: calculateEndTime(slot.start, slot.duration),
            duration_minutes: slot.duration,
            price_per_slot: parseFloat(bulkData.defaultPrice),
            is_available: true,
          };
          promises.push(createSlot.mutateAsync(slotData));
        }
      }
      
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Added ${preset.name} slots for selected days`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create slots",
        variant: "destructive",
      });
    }
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
    const endTime = calculateEndTime(startTime, durationMinutes);

    const slotData = {
      turf_id: turfId,
      day_of_week: formData.day_of_week,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      price: parseFloat(formData.price_per_slot),
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

  const getSlotsByDay = () => {
    const grouped = slots.reduce((acc, slot) => {
      if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
      acc[slot.day_of_week].push(slot);
      return acc;
    }, {} as Record<number, any[]>);
    
    // Sort slots within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading slots...</span>
      </div>
    );
  }

  const slotsByDay = getSlotsByDay();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day Selection */}
          <div>
            <Label className="text-sm font-medium">Select Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  variant={bulkData.selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBulkData(prev => ({
                      ...prev,
                      selectedDays: prev.selectedDays.includes(day.value)
                        ? prev.selectedDays.filter(d => d !== day.value)
                        : [...prev.selectedDays, day.value]
                    }));
                  }}
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>

          {/* Default Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultPrice">Default Price (₹)</Label>
              <Input
                id="defaultPrice"
                type="number"
                placeholder="e.g., 500"
                value={bulkData.defaultPrice}
                onChange={(e) => setBulkData({...bulkData, defaultPrice: e.target.value})}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {QUICK_PRESETS.map((preset) => (
                <Card key={preset.name} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50">
                  <CardContent className="p-4" onClick={() => handleQuickPreset(preset)}>
                    <h4 className="font-medium mb-2">{preset.name}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {preset.slots.slice(0, 3).map((slot, idx) => (
                        <div key={idx}>{slot.start} ({slot.duration}min)</div>
                      ))}
                      {preset.slots.length > 3 && <div>+{preset.slots.length - 3} more...</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Slots</TabsTrigger>
          <TabsTrigger value="add">Add Individual Slot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          {Object.keys(slotsByDay).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No slots configured yet</h3>
                <p className="text-muted-foreground mb-4">
                  Use Quick Setup above or add individual slots to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = slotsByDay[day.value] || [];
                if (daySlots.length === 0) return null;
                
                return (
                  <Card key={day.value}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {day.label}
                        <Badge variant="secondary">{daySlots.length} slots</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="font-medium">{slot.start_time}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({slot.duration_minutes}min)
                                </span>
                              </div>
                              <Badge variant={slot.is_available ? "default" : "secondary"}>
                                {slot.is_available ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">₹{slot.price_per_slot}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(slot)} className="flex-1">
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDelete(slot.id)}
                                disabled={deleteSlot.isPending}
                                className="px-3"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Individual Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((duration) => (
                        <Button
                          key={duration.value}
                          type="button"
                          variant={formData.duration_minutes === duration.value.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, duration_minutes: duration.value.toString()})}
                          className="flex-1"
                        >
                          <duration.icon className="w-3 h-3 mr-1" />
                          {duration.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price_per_slot">Price (₹)</Label>
                    <Input
                      id="price_per_slot"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price"
                      value={formData.price_per_slot}
                      onChange={(e) => setFormData({...formData, price_per_slot: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                  />
                  <Label htmlFor="is_available">Available for booking</Label>
                </div>

                <Button type="submit" disabled={createSlot.isPending || updateSlot.isPending} className="w-full">
                  {createSlot.isPending || updateSlot.isPending ? "Creating..." : "Create Slot"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isAddDialogOpen && editingSlot} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_day_of_week">Day of Week</Label>
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
                <Label htmlFor="edit_start_time">Start Time</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_duration_minutes">Duration</Label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      type="button"
                      variant={formData.duration_minutes === duration.value.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({...formData, duration_minutes: duration.value.toString()})}
                      className="flex-1"
                    >
                      <duration.icon className="w-3 h-3 mr-1" />
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="edit_price_per_slot">Price (₹)</Label>
                <Input
                  id="edit_price_per_slot"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_slot}
                  onChange={(e) => setFormData({...formData, price_per_slot: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
              />
              <Label htmlFor="edit_is_available">Available for booking</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateSlot.isPending} className="flex-1">
                {updateSlot.isPending ? "Updating..." : "Update Slot"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};