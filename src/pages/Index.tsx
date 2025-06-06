import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Users, Star, Clock, Wifi, Car, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 cricket-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            <span className="text-xl font-bold text-primary">TurfConnect</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Find Turfs</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Find Players</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">How it Works</a>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
                <Button onClick={() => navigate('/auth')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-in-hero">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Sports Turfs & <br />
              <span className="text-accent">Find Players</span> in Mumbai
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with players, book premium turfs, and elevate your game across Cricket, Football & Pickleball
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <MapPin className="text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Enter location in Mumbai..."
                    className="border-none focus:ring-0 text-foreground"
                  />
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <Calendar className="text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Select date..."
                    className="border-none focus:ring-0 text-foreground"
                  />
                </div>
                <Button size="lg" className="cricket-gradient text-white hover:opacity-90">
                  <Search className="w-5 h-5 mr-2" />
                  Search Turfs
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Sports Icons */}
        <div className="absolute top-20 left-10 animate-bounce-sports delay-100">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏏</span>
          </div>
        </div>
        <div className="absolute top-32 right-20 animate-bounce-sports delay-300">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚽</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce-sports delay-500">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-xl">🏓</span>
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Sport</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-8 text-center">
                <div className="cricket-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏏</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cricket</h3>
                <p className="text-muted-foreground">Find cricket pitches and form your team for the perfect match</p>
                <Badge variant="secondary" className="mt-3">125+ Turfs</Badge>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500">
              <CardContent className="p-8 text-center">
                <div className="football-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⚽</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Football</h3>
                <p className="text-muted-foreground">Book football fields and connect with passionate players</p>
                <Badge variant="secondary" className="mt-3">89+ Turfs</Badge>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-accent">
              <CardContent className="p-8 text-center">
                <div className="pickleball-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏓</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Pickleball</h3>
                <p className="text-muted-foreground">Discover pickleball courts and join the fastest growing sport</p>
                <Badge variant="secondary" className="mt-3">45+ Turfs</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Turfs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Turfs in Mumbai</h2>
            <Button variant="outline">View All Turfs</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Turf Card 1 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-primary">Cricket & Football</Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">4.8</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">PlayTime Sports Complex</h3>
                <div className="flex items-center space-x-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Bandra West, Mumbai</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span>WiFi</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="w-4 h-4 text-blue-500" />
                      <span>Parking</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹1,500</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                  <Button>Book Now</Button>
                </div>
              </CardContent>
            </Card>

            {/* Turf Card 2 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 football-gradient">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-blue-600">Football</Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">4.6</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Elite Football Arena</h3>
                <div className="flex items-center space-x-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Andheri East, Mumbai</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Floodlights</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>24/7</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹2,000</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                  <Button>Book Now</Button>
                </div>
              </CardContent>
            </Card>

            {/* Turf Card 3 */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 pickleball-gradient">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-yellow-600">Pickleball</Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">4.9</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Racquet Club Mumbai</h3>
                <div className="flex items-center space-x-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Powai, Mumbai</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span>AC Courts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>Pro Shop</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹800</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>
                  <Button>Book Now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How TurfConnect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="cricket-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Find Perfect Turf</h3>
              <p className="text-muted-foreground">Search by location, sport, and preferences to discover the ideal turf for your game</p>
            </div>
            <div className="text-center">
              <div className="football-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Book Instantly</h3>
              <p className="text-muted-foreground">Select your preferred time slot and book instantly with secure payment options</p>
            </div>
            <div className="text-center">
              <div className="pickleball-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Play Together</h3>
              <p className="text-muted-foreground">Find players, form teams, and enjoy your game with like-minded sports enthusiasts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 mumbai-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Game?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Join thousands of sports enthusiasts in Mumbai. Book your next game today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90">
              <Search className="w-5 h-5 mr-2" />
              Find Turfs Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              <Users className="w-5 h-5 mr-2" />
              Find Players
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 cricket-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TC</span>
                </div>
                <span className="text-xl font-bold">TurfConnect</span>
              </div>
              <p className="text-gray-400 mb-4">
                Mumbai's premier platform for booking sports turfs and connecting with players.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Turfs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Players</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sports</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cricket Turfs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Football Fields</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pickleball Courts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">All Sports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 hello@turfconnect.in</li>
                <li>📱 +91 98765 43210</li>
                <li>📍 Mumbai, Maharashtra</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TurfConnect. All rights reserved. Made with ❤️ for Mumbai sports lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
