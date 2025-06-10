
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, MapPin, Clock, Star } from 'lucide-react';

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.availableNow) count++;
    if (filters.availableToday) count++;
    if (filters.availableWeekend) count++;
    if (filters.maxDistance !== 25) count++;
    if (filters.skillLevelMin !== 1 || filters.skillLevelMax !== 10) count++;
    if (filters.ageMin !== 16 || filters.ageMax !== 60) count++;
    if (filters.gender !== 'any') count++;
    if (filters.positions.length > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`Search ${sport} players by name, location, or skill...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters Row */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Quick Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="default" className="ml-2">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Availability Quick Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Label className="text-sm font-medium">Available Now</Label>
              </div>
              <Switch
                checked={filters.availableNow}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableNow: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Label className="text-sm font-medium">Available Today</Label>
              </div>
              <Switch
                checked={filters.availableToday}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableToday: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <Label className="text-sm font-medium">Available Weekend</Label>
              </div>
              <Switch
                checked={filters.availableWeekend}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableWeekend: checked })
                }
              />
            </div>
          </div>

          {/* Distance and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Max Distance</span>
                </Label>
                <span className="text-sm font-medium text-primary">{filters.maxDistance}km</span>
              </div>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Skill Level</span>
                </Label>
                <span className="text-sm font-medium text-primary">
                  {filters.skillLevelMin} - {filters.skillLevelMax}
                </span>
              </div>
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
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Age Range</Label>
                <span className="text-sm font-medium text-primary">
                  {filters.ageMin} - {filters.ageMax} years
                </span>
              </div>
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
              <Label>Gender Preference</Label>
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
                  <SelectItem value="any">Any Gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Positions/Roles */}
            <div className="space-y-2">
              <Label>Preferred Positions ({sport})</Label>
              <div className="flex flex-wrap gap-2">
                {getSportPositions(sport).map((position) => (
                  <Badge
                    key={position}
                    variant={filters.positions.includes(position) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => togglePosition(position)}
                  >
                    {position}
                    {filters.positions.includes(position) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minimum Rating</Label>
                <span className="text-sm font-medium text-primary">
                  {filters.minRating > 0 ? `${filters.minRating}/5 ⭐` : 'Any rating'}
                </span>
              </div>
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

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerSearch;
