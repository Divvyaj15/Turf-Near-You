
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: 'cricket' | 'football' | 'pickleball';
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ isOpen, onClose, sport }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    startTime: '',
    durationHours: 2,
    location: '',
    turfId: '',
    playersNeeded: sport === 'cricket' ? 10 : sport === 'football' ? 10 : 3,
    skillLevelMin: 1,
    skillLevelMax: 10,
    costPerPlayer: '',
    equipmentAvailable: false,
    rsvpDeadline: ''
  });

  const handleCreateGame = async () => {
    if (!user || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('games')
        .insert({
          created_by: user.id,
          sport,
          title: gameData.title,
          description: gameData.description,
          game_date: format(date, 'yyyy-MM-dd'),
          start_time: gameData.startTime,
          duration_hours: gameData.durationHours,
          location: gameData.location,
          turf_id: gameData.turfId || null,
          players_needed: gameData.playersNeeded,
          skill_level_min: gameData.skillLevelMin,
          skill_level_max: gameData.skillLevelMax,
          cost_per_player: gameData.costPerPlayer ? parseFloat(gameData.costPerPlayer) : null,
          equipment_available: gameData.equipmentAvailable,
          rsvp_deadline: gameData.rsvpDeadline ? new Date(gameData.rsvpDeadline).toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Game created successfully. You can now invite players!"
      });

      onClose();
      
      // Reset form
      setGameData({
        title: '',
        description: '',
        startTime: '',
        durationHours: 2,
        location: '',
        turfId: '',
        playersNeeded: sport === 'cricket' ? 10 : sport === 'football' ? 10 : 3,
        skillLevelMin: 1,
        skillLevelMax: 10,
        costPerPlayer: '',
        equipmentAvailable: false,
        rsvpDeadline: ''
      });
      setDate(undefined);
      
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Create {sport.charAt(0).toUpperCase() + sport.slice(1)} Game</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Game Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Game Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Sunday Morning Cricket Match"
              value={gameData.title}
              onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about the game, rules, or special instructions..."
              value={gameData.description}
              onChange={(e) => setGameData({ ...gameData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Start Time *</Label>
              <Input
                id="time"
                type="time"
                value={gameData.startTime}
                onChange={(e) => setGameData({ ...gameData, startTime: e.target.value })}
              />
            </div>
          </div>

          {/* Duration and Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Select
                value={gameData.durationHours.toString()}
                onValueChange={(value) => setGameData({ ...gameData, durationHours: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="players">Players Needed</Label>
              <Input
                id="players"
                type="number"
                min="1"
                max="22"
                value={gameData.playersNeeded}
                onChange={(e) => setGameData({ ...gameData, playersNeeded: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Phoenix Mills, Andheri Sports Complex"
              value={gameData.location}
              onChange={(e) => setGameData({ ...gameData, location: e.target.value })}
            />
          </div>

          {/* Skill Level Range */}
          <div className="space-y-2">
            <Label>Skill Level Requirement</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={gameData.skillLevelMin.toString()}
                onValueChange={(value) => setGameData({ ...gameData, skillLevelMin: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Level {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={gameData.skillLevelMax.toString()}
                onValueChange={(value) => setGameData({ ...gameData, skillLevelMax: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Level {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Per Player */}
          <div className="space-y-2">
            <Label htmlFor="cost">Cost Per Player (₹)</Label>
            <Input
              id="cost"
              type="number"
              placeholder="0"
              value={gameData.costPerPlayer}
              onChange={(e) => setGameData({ ...gameData, costPerPlayer: e.target.value })}
            />
          </div>

          {/* Equipment Available */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={gameData.equipmentAvailable}
              onCheckedChange={(checked) => setGameData({ ...gameData, equipmentAvailable: checked })}
            />
            <Label>Equipment will be provided</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGame} 
              disabled={loading || !gameData.title || !date || !gameData.startTime}
              className="flex-1 cricket-gradient text-white"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGameModal;
