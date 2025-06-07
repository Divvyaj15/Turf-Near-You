
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import RoleSelection from '@/components/RoleSelection';
import OwnerRegistrationForm from '@/components/OwnerRegistrationForm';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'turf_owner' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'role' | 'owner-details' | 'complete'>('auth');
  
  const { signUp, signIn, user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'turf_owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          toast({
            title: "Error",
            description: "Please enter your full name",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!selectedRole) {
          setStep('role');
          setIsLoading(false);
          return;
        }
        
        result = await signUp(email, password, fullName, selectedRole);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (isSignUp) {
          if (selectedRole === 'turf_owner') {
            setStep('owner-details');
          } else {
            toast({
              title: "Success",
              description: "Account created successfully! Please check your email to verify your account.",
            });
          }
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setSelectedRole(null);
    setStep('auth');
    setIsSignUp(false);
  };

  const handleRoleSelect = (role: 'customer' | 'turf_owner') => {
    setSelectedRole(role);
    setStep('auth');
  };

  const handleOwnerRegistrationComplete = () => {
    setStep('complete');
    toast({
      title: "Registration Complete!",
      description: "Your application has been submitted. We'll review it within 24-48 hours.",
    });
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-6"
            onClick={() => setStep('auth')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign Up
          </Button>

          <Card className="shadow-2xl">
            <CardContent className="p-8">
              <RoleSelection 
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'owner-details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <OwnerRegistrationForm 
            onBack={() => setStep('auth')}
            onComplete={handleOwnerRegistrationComplete}
          />
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Application Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for registering as a turf owner. Our team will review your application within 24-48 hours and send you an email with the next steps.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 cricket-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TC</span>
              </div>
              <span className="text-2xl font-bold text-primary">TurfConnect</span>
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Join Mumbai\'s sports community' 
                : 'Sign in to book turfs and find players'
              }
            </p>
            {isSignUp && selectedRole && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  Creating account as: 
                </span>
                <span className="ml-2 text-sm font-medium capitalize">
                  {selectedRole.replace('_', ' ')}
                </span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ml-2 p-0 h-auto text-primary"
                  onClick={() => setStep('role')}
                >
                  Change
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full cricket-gradient text-white hover:opacity-90" 
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <Button
                  variant="link"
                  className="ml-2 p-0 h-auto text-primary"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    resetForm();
                  }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
