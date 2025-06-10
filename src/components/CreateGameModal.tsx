
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, IndianRupee, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: 'cricket' | 'football' | 'pickleball';
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ isOpen, onClose, sport }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameDate: '',
    startTime: '',
    duration: '2',
    location: '',
    turfId: '',
    playersNeeded: sport === 'cricket' ? '11' : sport === 'football' ? '11' : '4',
    skillLevelMin: '1',
    skillLevelMax: '10',
    costPerPlayer: '',
    equipmentAvailable: false,
    autoAcceptInvites: false
  });

  const mumbaiLocations = [
    'Bandra West', 'Andheri East', 'Powai', 'Malad West', 'Worli', 
    'Juhu', 'Goregaon', 'Borivali', 'Santacruz', 'Vile Parle'
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.gameDate || !formData.startTime || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Create game logic would go here
    console.log('Creating game:', formData);
    
    toast({
      title: "Game Created Successfully!",
      description: `Your ${sport} game "${formData.title}" has been created and players will be notified.`,
    });
    
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      gameDate: '',
      startTime: '',
      duration: '2',
      location: '',
      turfId: '',
      playersNeeded: sport === 'cricket' ? '11' : sport === 'football' ? '11' : '4',
      skillLevelMin: '1',
      skillLevelMax: '10',
      costPerPlayer: '',
      equipmentAvailable: false,
      autoAcceptInvites: false
    });
  };

  const getSportIcon = (sport: string) => {
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
            <span className="text-2xl">{getSportIcon(sport)}</span>
            <span>Create {sport.charAt(0).toUpperCase() + sport.slice(1)} Game</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Basic Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Game Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Game Title *</Label>
                  <Input
                    id="title"
                    placeholder={`e.g., Evening ${sport} match at Bandra`}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Any special instructions, rules, or information about the game..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gameDate">Date *</Label>
                  <Input
                    id="gameDate"
                    type="date"
                    value={formData.gameDate}
                    onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="1.5">1.5 hours</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="2.5">2.5 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Area/Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {mumbaiLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="turfId">Specific Turf (Optional)</Label>
                  <Select
                    value={formData.turfId}
                    onValueChange={(value) => setFormData({ ...formData, turfId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select turf or TBD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">To Be Decided</SelectItem>
                      <SelectItem value="turf1">Sports Club Bandra</SelectItem>
                      <SelectItem value="turf2">Andheri Sports Complex</SelectItem>
                      <SelectItem value="turf3">Powai Ground</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players & Skill */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Players & Requirements</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="playersNeeded">Players Needed</Label>
                  <Select
                    value={formData.playersNeeded}
                    onValueChange={(value) => setFormData({ ...formData, playersNeeded: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 2).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} players
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="skillLevelMin">Min Skill Level</Label>
                  <Select
                    value={formData.skillLevelMin}
                    onValueChange={(value) => setFormData({ ...formData, skillLevelMin: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="skillLevelMax">Max Skill Level</Label>
                  <Select
                    value={formData.skillLevelMax}
                    onValueChange={(value) => setFormData({ ...formData, skillLevelMax: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost & Equipment */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <IndianRupee className="w-4 h-4" />
                <span>Cost & Equipment</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costPerPlayer">Cost per Player (₹)</Label>
                  <Input
                    id="costPerPlayer"
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.costPerPlayer}
                    onChange={(e) => setFormData({ ...formData, costPerPlayer: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.equipmentAvailable}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, equipmentAvailable: checked })
                    }
                  />
                  <Label>Equipment will be provided</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Game Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.autoAcceptInvites}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, autoAcceptInvites: checked })
                  }
                />
                <Label>Auto-accept players who meet criteria</Label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 cricket-gradient text-white">
              Create Game & Invite Players
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGameModal;
