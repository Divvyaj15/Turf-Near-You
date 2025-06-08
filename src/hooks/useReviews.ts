
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Review {
  id: string;
  booking_id: string;
  turf_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export const useTurfReviews = (turfId: string) => {
  return useQuery({
    queryKey: ['turf-reviews', turfId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('turf_id', turfId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!turfId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: Partial<Review>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['turf-reviews', variables.turf_id] });
    },
  });
};
