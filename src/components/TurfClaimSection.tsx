import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Loader2 } from 'lucide-react';

interface TurfClaimSectionProps {
  userId: string;
  hasOwnerRole: boolean;
}

export function TurfClaimSection({ userId, hasOwnerRole }: TurfClaimSectionProps) {
  const [turfId, setTurfId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClaimTurf = async () => {
    if (!turfId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Turf ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if turf exists and is unclaimed
      const { data: turf, error: fetchError } = await supabase
        .from('turfs')
        .select('id, name, owner_id')
        .eq('id', turfId.trim())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!turf) {
        toast({
          title: "Error",
          description: "Turf ID not found. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      if (turf.owner_id) {
        toast({
          title: "Error",
          description: "This turf has already been claimed by another owner.",
          variant: "destructive"
        });
        return;
      }

      // Update turf with owner ID
      const { error: updateError } = await supabase
        .from('turfs')
        .update({ owner_id: userId })
        .eq('id', turfId.trim());

      if (updateError) throw updateError;

      // Grant owner role if they don't have it using secure function
      if (!hasOwnerRole) {
        const { error: roleError } = await supabase.rpc('grant_owner_role_to_user', {
          target_user_id: userId
        });

        if (roleError) {
          throw roleError;
        }
      }

      toast({
        title: "Success!",
        description: `You have successfully claimed ${turf.name}`,
      });

      // Redirect to owner dashboard
      setTimeout(() => {
        navigate(`/owner-dashboard?turf_id=${turfId.trim()}`);
      }, 1000);

    } catch (error: any) {
      console.error('Error claiming turf:', error);
      toast({
        title: "Error",
        description: "Failed to claim turf. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasOwnerRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Turf Owner Dashboard
          </CardTitle>
          <CardDescription>
            You already have owner access. Visit your dashboard to manage your turfs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/owner-dashboard')}>
            Go to Owner Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Claim Your Turf
        </CardTitle>
        <CardDescription>
          Are you a turf owner? Enter your unique Turf ID to claim ownership and access the owner dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="turfId" className="text-sm font-medium">
            Turf ID
          </label>
          <Input
            id="turfId"
            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440001"
            value={turfId}
            onChange={(e) => setTurfId(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Enter the unique ID provided for your turf facility
          </p>
        </div>
        <Button 
          onClick={handleClaimTurf} 
          disabled={isLoading || !turfId.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming Turf...
            </>
          ) : (
            'Claim Turf'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
