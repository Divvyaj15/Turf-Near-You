
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, MessageCircle, Users, Trophy } from 'lucide-react';

interface Player {
  id: string;
  full_name: string;
  age?: number;
  location?: string;
  phone_number: string;
  overall_rating?: number;
  total_games_played?: number;
  is_available: boolean;
  profile_image_url?: string;
  preferred_contact?: string;
  sports_profiles?: Array<{
    sport: string;
    skill_level?: number;
    preferred_positions?: string[];
  }>;
}

interface PlayerListCardProps {
  player: Player;
  onContact: (player: Player) => void;
  onInvite: (player: Player) => void;
}

const PlayerListCard: React.FC<PlayerListCardProps> = ({ player, onContact, onInvite }) => {
  const displayRating = player.overall_rating || 0;
  const displayGamesPlayed = player.total_games_played || 0;
  const hasStats = displayRating > 0 || displayGamesPlayed > 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{player.full_name}</h3>
                {player.age && (
                  <p className="text-sm text-gray-600">{player.age} years old</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={player.is_available ? "default" : "secondary"}>
                  {player.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            {/* Location */}
            {player.location && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {player.location}
              </div>
            )}

            {/* Rating and Games */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-1">
                {hasStats ? (
                  <>
                    {renderStars(displayRating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({displayRating.toFixed(1)})
                    </span>
                  </>
                ) : (
                  <>
                    {renderStars(0)}
                    <span className="text-sm text-gray-500 ml-1">
                      (No ratings yet)
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Trophy className="w-4 h-4 mr-1" />
                {hasStats ? `${displayGamesPlayed} games` : "No games yet"}
              </div>
            </div>

            {/* Sports and Skills */}
            {player.sports_profiles && player.sports_profiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {player.sports_profiles.map((sport, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {sport.sport} 
                      {sport.skill_level ? ` (${sport.skill_level}/10)` : ' (No skill set)'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContact(player)}
                className="flex-1"
              >
                {player.preferred_contact === 'call' ? (
                  <Phone className="w-4 h-4 mr-1" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-1" />
                )}
                Contact
              </Button>
              <Button
                size="sm"
                onClick={() => onInvite(player)}
                className="flex-1 cricket-gradient text-white"
              >
                <Users className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerListCard;
