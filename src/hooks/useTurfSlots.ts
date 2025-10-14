import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TurfSlot {
  id: string;
  turf_id: string;
  day_of_week: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTurfSlotData {
  turf_id: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  is_available?: boolean;
}

export const useTurfSlots = (turfId?: string) => {
  return useQuery({
    queryKey: ['turf-slots', turfId],
    queryFn: async () => {
      if (!turfId) return [];

      const { data, error } = await supabase
        .from('turf_slots')
        .select('*')
        .eq('turf_id', turfId)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!turfId,
  });
};

export const useOwnerTurfSlots = (turfId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-turf-slots', turfId, user?.id],
    queryFn: async () => {
      if (!turfId || !user) return [];

      const { data, error } = await supabase
        .from('turf_slots')
        .select('*')
        .eq('turf_id', turfId)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!turfId && !!user,
  });
};

export const useCreateTurfSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotData: CreateTurfSlotData) => {
      const { data, error } = await supabase
        .from('turf_slots')
        .insert(slotData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['turf-slots'] });
      queryClient.invalidateQueries({ queryKey: ['owner-turf-slots'] });
    },
  });
};

export const useUpdateTurfSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TurfSlot>) => {
      const { data, error } = await supabase
        .from('turf_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turf-slots'] });
      queryClient.invalidateQueries({ queryKey: ['owner-turf-slots'] });
    },
  });
};

export const useDeleteTurfSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('turf_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turf-slots'] });
      queryClient.invalidateQueries({ queryKey: ['owner-turf-slots'] });
    },
  });
};