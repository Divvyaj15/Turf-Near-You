import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, DollarSign, Star, Search } from 'lucide-react';
import { useTurfs } from '@/hooks/useTurfs';
import { useTurfReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TurfCardProps {
  turf: any;
  onBook: (turf: any) => void;
}

const TurfCard = ({ turf, onBook }: TurfCardProps) => {
  const { data: reviews = [] } = useTurfReviews(turf.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleBookClick = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to book a turf.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    onBook(turf);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {turf.cover_image_url && (
          <img
            src={turf.cover_image_url}
            alt={turf.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold">{turf.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {turf.area}
            </div>
          </div>

          {turf.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {turf.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="font-semibold">₹{turf.base_price_per_hour}/hour</span>
            </div>
            {turf.capacity && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                Up to {turf.capacity}
              </div>
            )}
          </div>

          {averageRating > 0 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-1">
                ({reviews.length} reviews)
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {turf.supported_sports?.slice(0, 3).map((sport: string) => (
              <Badge key={sport} variant="outline" className="text-xs">
                {sport}
              </Badge>
            ))}
            {turf.supported_sports?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{turf.supported_sports.length - 3}
              </Badge>
            )}
          </div>

          <Button 
            className="w-full" 
            onClick={handleBookClick}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface TurfSearchProps {
  onTurfSelect: (turf: any) => void;
}

const TurfSearch = ({ onTurfSelect }: TurfSearchProps) => {
  const { data: turfs = [], isLoading } = useTurfs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  const areas = [...new Set(turfs.map(turf => turf.area))];
  const sports = [...new Set(turfs.flatMap(turf => turf.supported_sports || []))];

  const filteredTurfs = turfs.filter(turf => {
    const matchesSearch = turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turf.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'all' || turf.area === selectedArea;
    const matchesSport = selectedSport === 'all' || turf.supported_sports?.includes(selectedSport);
    const matchesPrice = priceRange === 'all' || (() => {
      const price = turf.base_price_per_hour;
      switch (priceRange) {
        case 'low': return price <= 500;
        case 'medium': return price > 500 && price <= 1000;
        case 'high': return price > 1000;
        default: return true;
      }
    })();

    return matchesSearch && matchesArea && matchesSport && matchesPrice;
  });

  if (isLoading) {
    return <div className="p-6">Loading turfs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Find Your Perfect Turf</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger>
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger>
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map(sport => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Under ₹500</SelectItem>
              <SelectItem value="medium">₹500 - ₹1000</SelectItem>
              <SelectItem value="high">Above ₹1000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || selectedArea !== 'all' || selectedSport !== 'all' || priceRange !== 'all') && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('all');
                setSelectedSport('all');
                setPriceRange('all');
              }}
            >
              Clear Filters
            </Button>
            <span className="text-sm text-muted-foreground self-center">
              {filteredTurfs.length} turfs found
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTurfs.map((turf) => (
          <TurfCard
            key={turf.id}
            turf={turf}
            onBook={onTurfSelect}
          />
        ))}
      </div>

      {filteredTurfs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Turfs Found</h4>
            <p className="text-muted-foreground">
              Try adjusting your search criteria to find more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TurfSearch;
