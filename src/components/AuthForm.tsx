
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  email: string;
  password: string;
  fullName: string;
  selectedRole: 'customer' | 'turf_owner' | null;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onChangeRole: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  email,
  password,
  fullName,
  selectedRole,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSubmit,
  onToggleMode,
  onChangeRole
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
              onClick={onChangeRole}
            >
              Change
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!isSignUp && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
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
                  onChange={(e) => onPasswordChange(e.target.value)}
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
              {isLoading ? 'Loading...' : 'Sign In'}
            </Button>
          </form>
        )}

        {isSignUp && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                required={isSignUp}
              />
            </div>
            
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
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
                  onChange={(e) => onPasswordChange(e.target.value)}
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
              {isLoading ? 'Loading...' : (
                isSignUp 
                  ? (selectedRole === 'turf_owner' ? 'Continue to Business Details' : 'Create Account')
                  : 'Sign In'
              )}
            </Button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <Button
              variant="link"
              className="ml-2 p-0 h-auto text-primary"
              onClick={onToggleMode}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
