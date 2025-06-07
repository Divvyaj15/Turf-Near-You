
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Turf {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  area: string;
  contact_phone: string | null;
  contact_email: string | null;
  supported_sports: string[];
  amenities: string[];
  surface_type: string | null;
  capacity: number | null;
  cover_image_url: string | null;
  images: string[];
  base_price_per_hour: number;
  weekend_premium_percentage: number;
  peak_hours_premium_percentage: number;
  peak_hours_start: string | null;
  peak_hours_end: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export const useTurfs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['turfs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Turf[];
    },
    enabled: !!user,
  });
};

export const useOwnerTurfs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-turfs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the owner ID
      const { data: ownerData, error: ownerError } = await supabase
        .from('turf_owners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (ownerError) throw ownerError;

      // Then get turfs for this owner
      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('owner_id', ownerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Turf[];
    },
    enabled: !!user,
  });
};
