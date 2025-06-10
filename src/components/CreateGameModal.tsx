
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, MapPin, Users, Clock, Trophy, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: 'cricket' | 'football' | 'pickleball';
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ isOpen, onClose, sport }) => {
  const { toast } = useToast();
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    date: undefined as Date | undefined,
    startTime: '',
    duration: 2,
    location: '',
    playersNeeded: sport === 'cricket' ? 22 : sport === 'football' ? 22 : 4,
    skillLevelMin: 1,
    skillLevelMax: 10,
    costPerPlayer: 0,
    equipmentAvailable: false,
    autoAcceptRequests: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameData.title || !gameData.date || !gameData.startTime || !gameData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to your backend
    console.log('Creating game:', { ...gameData, sport });
    
    toast({
      title: "Game Created Successfully!",
      description: "Your game has been created and players will be notified.",
    });
    
    onClose();
    
    // Reset form
    setGameData({
      title: '',
      description: '',
      date: undefined,
      startTime: '',
      duration: 2,
      location: '',
      playersNeeded: sport === 'cricket' ? 22 : sport === 'football' ? 22 : 4,
      skillLevelMin: 1,
      skillLevelMax: 10,
      costPerPlayer: 0,
      equipmentAvailable: false,
      autoAcceptRequests: false
    });
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'cricket': return '🏏';
      case 'football': return '⚽';
      case 'pickleball': return '🏓';
      default: return '🏃';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <span className="text-2xl">{getSportEmoji(sport)}</span>
            <span>Create New {sport.charAt(0).toUpperCase() + sport.slice(1)} Game</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Game Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Game Title *</Label>
              <Input
                id="title"
                value={gameData.title}
                onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
                placeholder={`Sunday ${sport} match`}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={gameData.description}
                onChange={(e) => setGameData({ ...gameData, description: e.target.value })}
                placeholder="Tell players more about your game..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {gameData.date ? format(gameData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={gameData.date}
                    onSelect={(date) => setGameData({ ...gameData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={gameData.startTime}
                onChange={(e) => setGameData({ ...gameData, startTime: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Location and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location *</span>
              </Label>
              <Input
                id="location"
                value={gameData.location}
                onChange={(e) => setGameData({ ...gameData, location: e.target.value })}
                placeholder="Turf name or address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration" className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration (hours)</span>
              </Label>
              <Select
                value={gameData.duration.toString()}
                onValueChange={(value) => setGameData({ ...gameData, duration: parseInt(value) })}
              >
                <SelectTrigger className="mt-1">
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
          </div>

          {/* Players and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playersNeeded" className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Players Needed</span>
              </Label>
              <Input
                id="playersNeeded"
                type="number"
                min="2"
                max="50"
                value={gameData.playersNeeded}
                onChange={(e) => setGameData({ ...gameData, playersNeeded: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="costPerPlayer" className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Cost per Player (₹)</span>
              </Label>
              <Input
                id="costPerPlayer"
                type="number"
                min="0"
                value={gameData.costPerPlayer}
                onChange={(e) => setGameData({ ...gameData, costPerPlayer: parseInt(e.target.value) })}
                className="mt-1"
                placeholder="0 for free"
              />
            </div>
          </div>

          {/* Skill Level Range */}
          <div>
            <Label className="flex items-center space-x-1">
              <Trophy className="w-4 h-4" />
              <span>Skill Level Range</span>
            </Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="skillMin" className="text-sm text-gray-600">Minimum</Label>
                <Select
                  value={gameData.skillLevelMin.toString()}
                  onValueChange={(value) => setGameData({ ...gameData, skillLevelMin: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skillMax" className="text-sm text-gray-600">Maximum</Label>
                <Select
                  value={gameData.skillLevelMax.toString()}
                  onValueChange={(value) => setGameData({ ...gameData, skillLevelMax: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Equipment Available</Label>
                <p className="text-xs text-gray-600">We'll provide equipment for players</p>
              </div>
              <Switch
                checked={gameData.equipmentAvailable}
                onCheckedChange={(checked) => setGameData({ ...gameData, equipmentAvailable: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-accept Join Requests</Label>
                <p className="text-xs text-gray-600">Players can join without your approval</p>
              </div>
              <Switch
                checked={gameData.autoAcceptRequests}
                onCheckedChange={(checked) => setGameData({ ...gameData, autoAcceptRequests: checked })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 cricket-gradient text-white">
              Create Game
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGameModal;
