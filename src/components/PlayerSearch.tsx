
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface PlayerSearchProps {
  sport: 'cricket' | 'football' | 'pickleball';
  filters: {
    availableNow: boolean;
    availableToday: boolean;
    availableWeekend: boolean;
    maxDistance: number;
    skillLevelMin: number;
    skillLevelMax: number;
    ageMin: number;
    ageMax: number;
    gender: string;
    positions: string[];
    minRating: number;
  };
  onFiltersChange: (filters: any) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ sport, filters, onFiltersChange }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSportPositions = (sport: string) => {
    switch (sport) {
      case 'cricket':
        return ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'];
      case 'football':
        return ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
      case 'pickleball':
        return ['Aggressive', 'Defensive', 'All-court'];
      default:
        return [];
    }
  };

  const togglePosition = (position: string) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter(p => p !== position)
      : [...filters.positions, position];
    
    onFiltersChange({ ...filters, positions: newPositions });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      availableNow: false,
      availableToday: false,
      availableWeekend: false,
      maxDistance: 25,
      skillLevelMin: 1,
      skillLevelMax: 10,
      ageMin: 16,
      ageMax: 60,
      gender: 'any',
      positions: [],
      minRating: 0
    });
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search players by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quick Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Availability Toggles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.availableNow}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableNow: checked })
                }
              />
              <Label>Available Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.availableToday}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableToday: checked })
                }
              />
              <Label>Available Today</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.availableWeekend}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableWeekend: checked })
                }
              />
              <Label>Available Weekend</Label>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <Label>Max Distance: {filters.maxDistance}km</Label>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, maxDistance: value[0] })
              }
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Skill Level Range */}
          <div className="space-y-2">
            <Label>
              Skill Level: {filters.skillLevelMin} - {filters.skillLevelMax}
            </Label>
            <Slider
              value={[filters.skillLevelMin, filters.skillLevelMax]}
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  skillLevelMin: value[0], 
                  skillLevelMax: value[1] 
                })
              }
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range */}
            <div className="space-y-2">
              <Label>Age Range: {filters.ageMin} - {filters.ageMax}</Label>
              <Slider
                value={[filters.ageMin, filters.ageMax]}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    ageMin: value[0], 
                    ageMax: value[1] 
                  })
                }
                max={60}
                min={16}
                step={1}
                className="w-full"
              />
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={filters.gender}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Positions/Roles */}
            <div className="space-y-2">
              <Label>Preferred Positions</Label>
              <div className="flex flex-wrap gap-2">
                {getSportPositions(sport).map((position) => (
                  <Badge
                    key={position}
                    variant={filters.positions.includes(position) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePosition(position)}
                  >
                    {position}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating}/5</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, minRating: value[0] })
                }
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerSearch;
