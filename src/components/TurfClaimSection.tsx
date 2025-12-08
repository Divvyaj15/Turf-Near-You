import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TurfClaimSectionProps {
  userId: string;
  hasOwnerRole: boolean;
  onTurfClaimed?: () => void;
}

interface UnclaimedTurf {
  id: string;
  name: string;
  location: string;
}

export function TurfClaimSection({ userId, hasOwnerRole, onTurfClaimed }: TurfClaimSectionProps) {
  const [selectedTurfId, setSelectedTurfId] = useState('');
  const [unclaimedTurfs, setUnclaimedTurfs] = useState<UnclaimedTurf[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnclaimedTurfs();
  }, []);

  const fetchUnclaimedTurfs = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('id, name, location')
        .is('owner_id', null)
        .eq('is_approved', true)
        .order('name');

      if (error) throw error;
      setUnclaimedTurfs(data || []);
    } catch (error) {
      console.error('Error fetching unclaimed turfs:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleClaimTurf = async () => {
    if (!selectedTurfId) {
      toast({
        title: "Error",
        description: "Please select a turf to claim",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Double-check turf is still unclaimed
      const { data: turf, error: fetchError } = await supabase
        .from('turfs')
        .select('id, name, owner_id')
        .eq('id', selectedTurfId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!turf) {
        toast({
          title: "Error",
          description: "Turf not found. Please refresh and try again.",
          variant: "destructive"
        });
        await fetchUnclaimedTurfs();
        return;
      }

      if (turf.owner_id) {
        toast({
          title: "Error",
          description: "This turf has already been claimed by another owner.",
          variant: "destructive"
        });
        await fetchUnclaimedTurfs();
        setSelectedTurfId('');
        return;
      }

      // Update turf with owner ID
      const { error: updateError } = await supabase
        .from('turfs')
        .update({ owner_id: userId })
        .eq('id', selectedTurfId);

      if (updateError) throw updateError;

      // Grant owner role if they don't have it using secure function
      if (!hasOwnerRole) {
        const { error: roleError } = await supabase.rpc('grant_owner_role_to_user', {
          target_user_id: userId
        });

        if (roleError) {
          console.error('Role grant error:', roleError);
        }
      }

      toast({
        title: "Success!",
        description: `You have successfully claimed ${turf.name}`,
      });

      // Notify parent component
      if (onTurfClaimed) {
        onTurfClaimed();
      }

      // Redirect to owner dashboard
      setTimeout(() => {
        navigate(`/owner-dashboard?turf_id=${selectedTurfId}`);
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

  if (isFetching) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading available turfs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unclaimedTurfs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Claim Your Turf
          </CardTitle>
          <CardDescription>
            No turfs available for claiming at the moment. Please check back later.
          </CardDescription>
        </CardHeader>
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
          Select your turf from the list below to claim ownership and access the owner dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="turfSelect" className="text-sm font-medium">
            Select Turf
          </label>
          <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Choose your turf..." />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {unclaimedTurfs.map((turf) => (
                <SelectItem key={turf.id} value={turf.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{turf.name}</span>
                    <span className="text-xs text-muted-foreground">{turf.location}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {unclaimedTurfs.length} turf(s) available for claiming
          </p>
        </div>
        <Button 
          onClick={handleClaimTurf} 
          disabled={isLoading || !selectedTurfId}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming Turf...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Claim Turf
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
