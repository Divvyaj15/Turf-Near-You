
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Turf {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  location: string;
  address: string | null;
  sport_type: string | null;
  surface_type: string | null;
  size: string | null;
  amenities: string[] | null;
  images: string[] | null;
  hourly_rate: number;
  latitude: number | null;
  longitude: number | null;
  is_approved: boolean;
  is_active: boolean;
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

      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Turf[];
    },
    enabled: !!user,
  });
};
