
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
  // Empty array since there are no players in the database
  const mockPlayers: any[] = [];

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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Players Available</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Currently there are no {sport} players in Mumbai. 
                  Be the first to join and create a profile!
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

      {/* Map Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Players Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0.0km</div>
              <div className="text-sm text-gray-600">Avg Distance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">0.0</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Players Message */}
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No players found in this area</h3>
        <p className="text-gray-600 mb-4">
          Be the first to create a player profile and start connecting with others!
        </p>
        <Button variant="outline">
          Create Player Profile
        </Button>
      </div>
    </div>
  );
};

export default PlayerMapView;
