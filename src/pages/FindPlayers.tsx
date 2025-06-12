
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Filter, Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PlayerListCard from '@/components/PlayerListCard';
import CreateGameModal from '@/components/CreateGameModal';
import Navbar from '@/components/Navbar';

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

const FindPlayers = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [showCreateGame, setShowCreateGame] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole === 'turf_owner') {
      navigate('/owner-dashboard');
      return;
    }

    fetchPlayers();
  }, [user, userRole, navigate]);

  const fetchPlayers = async () => {
    try {
      // Fetch user profiles with sports profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          age,
          location,
          phone_number,
          overall_rating,
          total_games_played,
          is_available,
          profile_image_url,
          preferred_contact
        `)
        .eq('is_available', true)
        .neq('id', user?.id); // Exclude current user

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        toast({
          title: "Error",
          description: "Failed to fetch players",
          variant: "destructive"
        });
        return;
      }

      // Fetch sports profiles for each user
      const playerIds = profiles?.map(p => p.id) || [];
      const { data: sportsProfiles, error: sportsError } = await supabase
        .from('user_sports_profiles')
        .select('*')
        .in('user_id', playerIds)
        .eq('is_active', true);

      if (sportsError) {
        console.error('Error fetching sports profiles:', sportsError);
      }

      // Combine the data
      const playersWithSports = profiles?.map(profile => ({
        ...profile,
        sports_profiles: sportsProfiles?.filter(sp => sp.user_id === profile.id) || []
      })) || [];

      setPlayers(playersWithSports);
    } catch (error) {
      console.error('Error in fetchPlayers:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (player: Player) => {
    const message = encodeURIComponent(`Hi ${player.full_name}, I found you on TurfConnect and would like to connect for a game!`);
    
    if (player.preferred_contact === 'call') {
      window.open(`tel:${player.phone_number}`);
    } else {
      // Default to WhatsApp
      window.open(`https://wa.me/${player.phone_number.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleInvite = (player: Player) => {
    toast({
      title: "Feature Coming Soon",
      description: `Game invitation feature for ${player.full_name} will be available soon!`,
    });
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || 
                        player.sports_profiles?.some(sp => sp.sport === selectedSport);
    
    return matchesSearch && matchesSport;
  });

  const availableSports = ['all', 'cricket', 'football', 'pickleball'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">Loading players...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Players</h1>
            <p className="text-gray-600">Connect with players in your area</p>
          </div>
          <Button 
            onClick={() => setShowCreateGame(true)}
            className="cricket-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Game
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {availableSports.map((sport) => (
                  <Button
                    key={sport}
                    variant={selectedSport === sport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSport(sport)}
                    className="capitalize"
                  >
                    {sport === 'all' ? 'All Sports' : sport}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        {filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Players Found</h3>
              <p className="text-gray-500 mb-4">
                {players.length === 0 
                  ? "No players have registered yet. Be the first to invite your friends!"
                  : "Try adjusting your search criteria to find more players."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerListCard
                key={player.id}
                player={player}
                onContact={handleContact}
                onInvite={handleInvite}
              />
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredPlayers.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            Showing {filteredPlayers.length} of {players.length} available players
          </div>
        )}
      </div>

      {/* Create Game Modal */}
      {showCreateGame && (
        <CreateGameModal
          onClose={() => setShowCreateGame(false)}
          onGameCreated={() => {
            setShowCreateGame(false);
            toast({
              title: "Game Created!",
              description: "Your game has been created successfully.",
            });
          }}
        />
      )}
    </div>
  );
};

export default FindPlayers;
