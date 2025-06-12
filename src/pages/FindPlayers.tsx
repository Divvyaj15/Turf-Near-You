
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MapPin, Filter, Plus, Search, Trophy, Star } from 'lucide-react';
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

  const sports = [
    { 
      id: 'cricket', 
      name: 'Cricket', 
      icon: '🏏',
      color: 'bg-green-500',
      players: '2,341',
      games: '156'
    },
    { 
      id: 'football', 
      name: 'Football', 
      icon: '⚽',
      color: 'bg-blue-500',
      players: '1,892',
      games: '89'
    },
    { 
      id: 'pickleball', 
      name: 'Pickleball', 
      icon: '🏓',
      color: 'bg-purple-500',
      players: '743',
      games: '45'
    }
  ];

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

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">290+</div>
              <div className="text-sm text-gray-600">Games Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-gray-600">Premium Turfs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Sport Selection */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2 flex items-center justify-center space-x-2">
              <Trophy className="w-6 h-6 text-primary" />
              <span>Choose Your Sport</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sports.map((sport) => (
                <Card 
                  key={sport.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                    selectedSport === sport.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedSport(sport.id as any)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{sport.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{sport.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Players:</span>
                        <span className="font-medium text-primary">{sport.players}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Games Today:</span>
                        <span className="font-medium text-primary">{sport.games}</span>
                      </div>
                    </div>
                    {selectedSport === sport.id && (
                      <div className="w-full h-1 bg-primary rounded-full"></div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <PlayerSearch
          sport={selectedSport}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
        />

        {/* View Toggle and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Active filters: {Object.values(searchFilters).filter(v => 
                typeof v === 'boolean' ? v : 
                Array.isArray(v) ? v.length > 0 : 
                typeof v === 'string' ? v !== 'any' : false
              ).length}
            </div>
            
            <div className="text-sm font-medium text-primary flex items-center">
              <Search className="w-4 h-4 mr-1" />
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
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Ready to Play?</h3>
                <p className="text-white/90">
                  Create a game and invite players automatically, or browse more games
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => navigate('/customer-dashboard')}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <Star className="w-4 h-4 mr-2" />
                  View My Games
                </Button>
                <Button 
                  onClick={() => setShowCreateGame(true)} 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
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
