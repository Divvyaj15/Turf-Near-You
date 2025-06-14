
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  Clock,
  Trophy,
  Search,
  UserPlus,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<'cricket' | 'football' | 'pickleball'>('cricket');

  const handleBookTurf = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to book a turf.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate('/customer-dashboard');
  };

  const handleFindPlayers = () => {
    if (!user) {
      toast({
        title: "Sign In Required", 
        description: "Please sign in to find players.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate('/find-players');
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

  const features = [
    {
      icon: Search,
      title: "Find Players",
      description: "Discover players in your area with advanced filtering",
      action: handleFindPlayers
    },
    {
      icon: Calendar,
      title: "Book Turfs",
      description: "Reserve premium sports facilities",
      action: handleBookTurf
    },
    {
      icon: Users,
      title: "Join Games",
      description: "Connect with local sports communities",
      action: handleFindPlayers
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your sports journey and achievements",
      action: handleBookTurf
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-primary">Sports Match</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with players, book premium turfs, and elevate your game in Mumbai's premier sports community
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="cricket-gradient text-white px-8 py-4 text-lg"
              onClick={handleFindPlayers}
            >
              <Users className="w-5 h-5 mr-2" />
              Find Players Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg"
              onClick={handleBookTurf}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Turf
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">290+</div>
              <div className="text-sm text-gray-600">Games Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-gray-600">Premium Turfs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Sport Selection */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Choose Your Sport</CardTitle>
            <CardDescription>Select a sport to see available players and games in Mumbai</CardDescription>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Players:</span>
                        <Badge variant="secondary">{sport.players}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Games Today:</span>
                        <Badge variant="default">{sport.games}</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFindPlayers();
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find {sport.name} Players
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={feature.action}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Section */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of players in Mumbai and discover your next game
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleFindPlayers}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Find Players
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>All Mumbai Areas</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>Verified Players</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
