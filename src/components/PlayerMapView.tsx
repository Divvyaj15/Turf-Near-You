
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Star, MessageCircle, UserPlus } from 'lucide-react';

interface PlayerMapViewProps {
  sport: string;
  filters: any;
  onInvitePlayer: (playerId: string) => void;
}

const PlayerMapView: React.FC<PlayerMapViewProps> = ({ sport, filters, onInvitePlayer }) => {
  // Mock data for demonstration
  const mockPlayers = [
    {
      id: '1',
      name: 'Rahul Sharma',
      location: 'Bandra West',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      skillLevel: 8,
      rating: 4.5,
      isAvailable: true,
      sport: 'cricket'
    },
    {
      id: '2', 
      name: 'Priya Patel',
      location: 'Andheri East',
      coordinates: { lat: 19.1136, lng: 72.8697 },
      skillLevel: 6,
      rating: 4.2,
      isAvailable: true,
      sport: 'cricket'
    },
    {
      id: '3',
      name: 'Arjun Kumar',
      location: 'Powai',
      coordinates: { lat: 19.1197, lng: 72.9056 },
      skillLevel: 7,
      rating: 4.7,
      isAvailable: false,
      sport: 'cricket'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Map Placeholder */}
      <Card className="h-96">
        <CardContent className="p-0 h-full relative">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Interactive Map View</h3>
              <p className="text-gray-600 max-w-md">
                Map integration will show real player locations with clustering and distance calculations.
                Click on markers to view player details and send invitations.
              </p>
            </div>
          </div>
          
          {/* Mock Markers */}
          {mockPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                player.isAvailable ? 'bg-green-500' : 'bg-gray-400'
              }`}
              style={{
                top: `${30 + index * 15}%`,
                left: `${40 + index * 10}%`
              }}
              title={player.name}
            >
              {index + 1}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Players List Below Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{player.name}</h3>
                <Badge variant={player.isAvailable ? "default" : "secondary"}>
                  {player.isAvailable ? "Available" : "Busy"}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {player.location}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Skill Level: {player.skillLevel}/10</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    {player.rating}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 cricket-gradient text-white"
                  onClick={() => onInvitePlayer(player.id)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Players Message */}
      {mockPlayers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No players found in this area</h3>
          <p className="text-gray-600">
            Try expanding your search radius or adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerMapView;
