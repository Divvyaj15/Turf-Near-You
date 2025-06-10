
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Star, MessageCircle, UserPlus, Navigation } from 'lucide-react';

interface PlayerMapViewProps {
  sport: string;
  filters: any;
  onInvitePlayer: (playerId: string) => void;
}

const PlayerMapView: React.FC<PlayerMapViewProps> = ({ sport, filters, onInvitePlayer }) => {
  // Mock data for demonstration with Mumbai locations
  const mockPlayers = [
    {
      id: '1',
      name: 'Rahul Sharma',
      location: 'Bandra West',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      skillLevel: 8,
      rating: 4.5,
      isAvailable: true,
      sport: 'cricket',
      age: 28,
      totalGames: 45,
      positions: ['Batsman', 'All-rounder'],
      profileImage: null,
      distance: 2.3
    },
    {
      id: '2', 
      name: 'Priya Patel',
      location: 'Andheri East',
      coordinates: { lat: 19.1136, lng: 72.8697 },
      skillLevel: 6,
      rating: 4.2,
      isAvailable: true,
      sport: 'cricket',
      age: 24,
      totalGames: 32,
      positions: ['Bowler'],
      profileImage: null,
      distance: 5.1
    },
    {
      id: '3',
      name: 'Arjun Kumar',
      location: 'Powai',
      coordinates: { lat: 19.1197, lng: 72.9056 },
      skillLevel: 7,
      rating: 4.7,
      isAvailable: false,
      sport: 'cricket',
      age: 30,
      totalGames: 67,
      positions: ['Wicket Keeper', 'Batsman'],
      profileImage: null,
      distance: 8.2
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      location: 'Malad West',
      coordinates: { lat: 19.1875, lng: 72.8358 },
      skillLevel: 5,
      rating: 4.0,
      isAvailable: true,
      sport: 'cricket',
      age: 22,
      totalGames: 18,
      positions: ['Bowler'],
      profileImage: null,
      distance: 12.5
    },
    {
      id: '5',
      name: 'Vikram Singh',
      location: 'Worli',
      coordinates: { lat: 19.0176, lng: 72.8153 },
      skillLevel: 9,
      rating: 4.8,
      isAvailable: true,
      sport: 'cricket',
      age: 26,
      totalGames: 89,
      positions: ['All-rounder'],
      profileImage: null,
      distance: 4.7
    }
  ];

  return (
    <div className="space-y-4">
      {/* Interactive Map Placeholder */}
      <Card className="h-96">
        <CardContent className="p-0 h-full relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-100 to-indigo-100 rounded-lg relative">
            {/* Map Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-white rounded-lg shadow-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">Mumbai Player Map</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>Within {filters.maxDistance}km</span>
                </div>
              </div>
            </div>

            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-md">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Player Map</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time locations of available {sport} players in Mumbai. 
                  Click markers to view profiles and send invitations.
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Busy</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mock Map Markers */}
            {mockPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-lg hover:scale-110 transition-transform ${
                  player.isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'
                }`}
                style={{
                  top: `${25 + index * 12}%`,
                  left: `${30 + index * 15}%`
                }}
                title={`${player.name} - ${player.location}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {player.isAvailable && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}

            {/* Distance Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Distance from you</div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>&lt; 5km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>5-15km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>&gt; 15km</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players List Below Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-4">
              {/* Player Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={player.profileImage} />
                    <AvatarFallback>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    player.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{player.name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {player.location}
                    <span className="ml-2">• {player.age}y</span>
                  </div>
                </div>
                <Badge variant={player.isAvailable ? "default" : "secondary"}>
                  {player.isAvailable ? "Available" : "Busy"}
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{player.rating}</span>
                  <span className="text-gray-500">({player.totalGames} games)</span>
                </div>
                <div className="text-primary font-medium">
                  Level {player.skillLevel}/10
                </div>
              </div>

              {/* Distance */}
              <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                <span>{player.distance}km away</span>
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>~{Math.round(player.distance * 3)} min</span>
                </div>
              </div>

              {/* Positions */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {player.positions.slice(0, 2).map((position) => (
                    <Badge key={position} variant="secondary" className="text-xs">
                      {position}
                    </Badge>
                  ))}
                  {player.positions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{player.positions.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => console.log('Message player:', player.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button
                  size="sm"
                  className="flex-1 cricket-gradient text-white"
                  onClick={() => onInvitePlayer(player.id)}
                  disabled={!player.isAvailable}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{mockPlayers.length}</div>
              <div className="text-sm text-gray-600">Players Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {mockPlayers.filter(p => p.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(mockPlayers.reduce((sum, p) => sum + p.distance, 0) / mockPlayers.length).toFixed(1)}km
              </div>
              <div className="text-sm text-gray-600">Avg Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {(mockPlayers.reduce((sum, p) => sum + p.rating, 0) / mockPlayers.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Players Message */}
      {mockPlayers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No players found in this area</h3>
          <p className="text-gray-600 mb-4">
            Try expanding your search radius or adjusting your filters.
          </p>
          <Button variant="outline">
            Expand Search Area
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayerMapView;
