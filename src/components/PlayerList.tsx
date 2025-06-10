
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Clock, 
  MessageCircle, 
  UserPlus,
  Shield,
  Trophy,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerListProps {
  sport: string;
  filters: any;
  onInvitePlayer: (playerId: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ sport, filters, onInvitePlayer }) => {
  const { data: players, isLoading } = useQuery({
    queryKey: ['players', sport, filters],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          user_sports_profiles(
            sport,
            skill_level,
            preferred_positions,
            batting_style,
            bowling_style,
            playing_foot,
            experience_level
          ),
          user_availability(
            day_of_week,
            time_slot,
            is_available
          )
        `)
        .eq('user_sports_profiles.sport', sport)
        .eq('user_sports_profiles.is_active', true);

      if (filters.availableNow || filters.availableToday) {
        query = query.eq('is_available', true);
      }

      if (filters.skillLevelMin && filters.skillLevelMax) {
        query = query
          .gte('user_sports_profiles.skill_level', filters.skillLevelMin)
          .lte('user_sports_profiles.skill_level', filters.skillLevelMax);
      }

      if (filters.ageMin && filters.ageMax) {
        query = query
          .gte('age', filters.ageMin)
          .lte('age', filters.ageMax);
      }

      if (filters.gender !== 'any') {
        query = query.eq('gender', filters.gender);
      }

      if (filters.minRating > 0) {
        query = query.gte('overall_rating', filters.minRating);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  const getAvailabilityStatus = (player: any) => {
    if (player.is_available) {
      return { status: 'Available', color: 'bg-green-500' };
    }
    return { status: 'Busy', color: 'bg-gray-400' };
  };

  const getSportSpecificInfo = (player: any, sport: string) => {
    const sportsProfile = Array.isArray(player.user_sports_profiles) 
      ? player.user_sports_profiles[0] 
      : null;
    
    if (!sportsProfile) return null;

    switch (sport) {
      case 'cricket':
        return {
          positions: sportsProfile.preferred_positions || [],
          extra: `${sportsProfile.batting_style || 'Right'} handed, ${sportsProfile.bowling_style || 'Medium pace'}`
        };
      case 'football':
        return {
          positions: sportsProfile.preferred_positions || [],
          extra: `${sportsProfile.playing_foot || 'Right'} footed`
        };
      case 'pickleball':
        return {
          positions: sportsProfile.preferred_positions || [],
          extra: sportsProfile.experience_level || 'Intermediate'
        };
      default:
        return { positions: [], extra: '' };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players?.map((player) => {
        const availability = getAvailabilityStatus(player);
        const sportsProfile = Array.isArray(player.user_sports_profiles) 
          ? player.user_sports_profiles[0] 
          : null;
        const sportInfo = getSportSpecificInfo(player, sport);

        return (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Player Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={player.profile_image_url} />
                    <AvatarFallback>
                      {player.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${availability.color} rounded-full border-2 border-white`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{player.full_name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {player.location || 'Mumbai'}
                    {player.age && <span className="ml-2">• {player.age}y</span>}
                  </div>
                </div>
              </div>

              {/* Skill and Rating */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Level {sportsProfile?.skill_level || 1}/10
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {player.overall_rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({player.total_games_played || 0} games)
                  </span>
                </div>
              </div>

              {/* Positions */}
              {sportInfo?.positions && sportInfo.positions.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {sportInfo.positions.slice(0, 2).map((position) => (
                      <Badge key={position} variant="secondary" className="text-xs">
                        {position}
                      </Badge>
                    ))}
                    {sportInfo.positions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sportInfo.positions.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {sportInfo?.extra && (
                <p className="text-xs text-gray-600 mb-3">{sportInfo.extra}</p>
              )}

              {/* Availability */}
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{availability.status}</span>
                {player.cricheroes_verified && sport === 'cricket' && (
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-blue-600">Verified</span>
                  </div>
                )}
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
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {players?.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search in a different area.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
