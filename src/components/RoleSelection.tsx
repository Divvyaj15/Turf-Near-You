
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2 } from 'lucide-react';

interface RoleSelectionProps {
  selectedRole: 'customer' | 'turf_owner' | null;
  onRoleSelect: (role: 'customer' | 'turf_owner') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ selectedRole, onRoleSelect }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your Account Type</h3>
        <p className="text-muted-foreground">Select how you'll be using TurfConnect</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRole === 'customer' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onRoleSelect('customer')}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Player/Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Book turfs, find players, and join the sports community
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Book sports turfs</li>
              <li>• Find players to join</li>
              <li>• Track your games</li>
              <li>• Leave reviews</li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRole === 'turf_owner' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onRoleSelect('turf_owner')}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-3">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">Turf Owner</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              List your turfs, manage bookings, and grow your business
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• List multiple turfs</li>
              <li>• Manage bookings</li>
              <li>• Track earnings</li>
              <li>• Customer analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
