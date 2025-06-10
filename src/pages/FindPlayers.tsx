
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MapPin, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlayerSearch from '@/components/PlayerSearch';
import PlayerList from '@/components/PlayerList';
import PlayerMapView from '@/components/PlayerMapView';
import CreateGameModal from '@/components/CreateGameModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const FindPlayers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<'cricket' | 'football' | 'pickleball'>('cricket');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    availableNow: false,
    availableToday: false,
    availableWeekend: false,
    maxDistance: 25,
    skillLevelMin: 1,
    skillLevelMax: 10,
    ageMin: 16,
    ageMax: 60,
    gender: 'any',
    positions: [] as string[],
    minRating: 0
  });

  const handleInvitePlayer = (playerId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to invite players to your games.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Player Invited",
      description: "Game invitation sent successfully!",
    });
    console.log('Inviting player:', playerId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to find and connect with other players in your area.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Players</h1>
              <p className="text-gray-600">Connect with players in Mumbai</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateGame(true)}
            className="cricket-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Game
          </Button>
        </div>

        {/* Sport Selection */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Select Sport</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSport} onValueChange={(value) => setSelectedSport(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cricket" className="flex items-center space-x-2">
                  🏏 Cricket
                </TabsTrigger>
                <TabsTrigger value="football" className="flex items-center space-x-2">
                  ⚽ Football
                </TabsTrigger>
                <TabsTrigger value="pickleball" className="flex items-center space-x-2">
                  🏓 Pickleball
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <PlayerSearch
          sport={selectedSport}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
        />

        {/* View Toggle and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              size="sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Active filters: {Object.values(searchFilters).filter(v => 
                typeof v === 'boolean' ? v : 
                Array.isArray(v) ? v.length > 0 : 
                typeof v === 'string' ? v !== 'any' : false
              ).length}
            </div>
            
            <div className="text-sm font-medium text-primary">
              Searching for {selectedSport} players
            </div>
          </div>
        </div>

        {/* Player Results */}
        <div className="mb-6">
          {viewMode === 'list' ? (
            <PlayerList
              sport={selectedSport}
              filters={searchFilters}
              onInvitePlayer={handleInvitePlayer}
            />
          ) : (
            <PlayerMapView
              sport={selectedSport}
              filters={searchFilters}
              onInvitePlayer={handleInvitePlayer}
            />
          )}
        </div>

        {/* Quick Actions Footer */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <strong>Need more players?</strong> Create a game and invite players automatically
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => navigate('/customer-dashboard')}>
                  View My Games
                </Button>
                <Button onClick={() => setShowCreateGame(true)} className="cricket-gradient text-white">
                  Create New Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Game Modal */}
        <CreateGameModal
          isOpen={showCreateGame}
          onClose={() => setShowCreateGame(false)}
          sport={selectedSport}
        />
      </div>
    </div>
  );
};

export default FindPlayers;
