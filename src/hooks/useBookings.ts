
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  id: string;
  turf_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  base_price: number;
  premium_charges: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  player_name: string;
  player_phone: string;
  player_email?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  turfs?: {
    name: string;
    area: string;
    address: string;
  };
}

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          turfs:turf_id (
            name,
            area,
            address
          )
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
};

export const useOwnerBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get bookings for owner's turfs
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          turfs:turf_id (
            name,
            area,
            address
          )
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: Partial<Booking>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Booking>) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
    },
  });
};
