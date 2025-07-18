export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          base_price: number
          booking_date: string
          created_at: string | null
          end_time: string
          id: string
          payment_status: string | null
          player_email: string | null
          player_name: string
          player_phone: string
          premium_charges: number | null
          special_requests: string | null
          start_time: string
          status: string | null
          total_amount: number
          total_hours: number
          turf_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_price: number
          booking_date: string
          created_at?: string | null
          end_time: string
          id?: string
          payment_status?: string | null
          player_email?: string | null
          player_name: string
          player_phone: string
          premium_charges?: number | null
          special_requests?: string | null
          start_time: string
          status?: string | null
          total_amount: number
          total_hours: number
          turf_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_price?: number
          booking_date?: string
          created_at?: string | null
          end_time?: string
          id?: string
          payment_status?: string | null
          player_email?: string | null
          player_name?: string
          player_phone?: string
          premium_charges?: number | null
          special_requests?: string | null
          start_time?: string
          status?: string | null
          total_amount?: number
          total_hours?: number
          turf_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_turf_id_fkey"
            columns: ["turf_id"]
            isOneToOne: false
            referencedRelation: "turfs"
            referencedColumns: ["id"]
          },
        ]
      }
      game_invitations: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          invited_by: string
          invited_user_id: string
          message: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          invited_by: string
          invited_user_id: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          invited_by?: string
          invited_user_id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_invitations_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          cost_per_player: number | null
          created_at: string | null
          created_by: string
          current_players: number | null
          description: string | null
          duration_hours: number | null
          equipment_available: boolean | null
          game_date: string
          id: string
          location: string | null
          players_needed: number | null
          rsvp_deadline: string | null
          skill_level_max: number | null
          skill_level_min: number | null
          sport: string
          start_time: string
          status: string | null
          title: string
          turf_id: string | null
          updated_at: string | null
        }
        Insert: {
          cost_per_player?: number | null
          created_at?: string | null
          created_by: string
          current_players?: number | null
          description?: string | null
          duration_hours?: number | null
          equipment_available?: boolean | null
          game_date: string
          id?: string
          location?: string | null
          players_needed?: number | null
          rsvp_deadline?: string | null
          skill_level_max?: number | null
          skill_level_min?: number | null
          sport: string
          start_time: string
          status?: string | null
          title: string
          turf_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_per_player?: number | null
          created_at?: string | null
          created_by?: string
          current_players?: number | null
          description?: string | null
          duration_hours?: number | null
          equipment_available?: boolean | null
          game_date?: string
          id?: string
          location?: string | null
          players_needed?: number | null
          rsvp_deadline?: string | null
          skill_level_max?: number | null
          skill_level_min?: number | null
          sport?: string
          start_time?: string
          status?: string | null
          title?: string
          turf_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_turf_id_fkey"
            columns: ["turf_id"]
            isOneToOne: false
            referencedRelation: "turfs"
            referencedColumns: ["id"]
          },
        ]
      }
      player_reviews: {
        Row: {
          categories: Json | null
          comment: string | null
          created_at: string | null
          game_id: string
          id: string
          rating: number | null
          reviewed_user_id: string
          reviewer_id: string
        }
        Insert: {
          categories?: Json | null
          comment?: string | null
          created_at?: string | null
          game_id: string
          id?: string
          rating?: number | null
          reviewed_user_id: string
          reviewer_id: string
        }
        Update: {
          categories?: Json | null
          comment?: string | null
          created_at?: string | null
          game_id?: string
          id?: string
          rating?: number | null
          reviewed_user_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          preferred_sports: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          skill_levels: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          preferred_sports?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skill_levels?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          preferred_sports?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skill_levels?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          turf_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          turf_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          turf_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_turf_id_fkey"
            columns: ["turf_id"]
            isOneToOne: false
            referencedRelation: "turfs"
            referencedColumns: ["id"]
          },
        ]
      }
      turf_owners: {
        Row: {
          address: string | null
          business_name: string
          business_type: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          owner_name: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
          years_of_operation: number | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          owner_name: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          years_of_operation?: number | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          owner_name?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          years_of_operation?: number | null
        }
        Relationships: []
      }
      turfs: {
        Row: {
          address: string
          amenities: string[] | null
          area: string
          base_price_per_hour: number
          capacity: number | null
          contact_email: string | null
          contact_phone: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          name: string
          owner_id: string
          peak_hours_end: string | null
          peak_hours_premium_percentage: number | null
          peak_hours_start: string | null
          status: string | null
          supported_sports: string[] | null
          surface_type: string | null
          updated_at: string | null
          weekend_premium_percentage: number | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area: string
          base_price_per_hour: number
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name: string
          owner_id: string
          peak_hours_end?: string | null
          peak_hours_premium_percentage?: number | null
          peak_hours_start?: string | null
          status?: string | null
          supported_sports?: string[] | null
          surface_type?: string | null
          updated_at?: string | null
          weekend_premium_percentage?: number | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area?: string
          base_price_per_hour?: number
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          name?: string
          owner_id?: string
          peak_hours_end?: string | null
          peak_hours_premium_percentage?: number | null
          peak_hours_start?: string | null
          status?: string | null
          supported_sports?: string[] | null
          surface_type?: string | null
          updated_at?: string | null
          weekend_premium_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "turfs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "turf_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          id: string
          is_available: boolean | null
          time_slot: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_available?: boolean | null
          time_slot: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_available?: boolean | null
          time_slot?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          auto_accept_invites: boolean | null
          created_at: string | null
          cricheroes_username: string | null
          cricheroes_verified: boolean | null
          full_name: string
          gender: string | null
          id: string
          is_available: boolean | null
          last_seen: string | null
          location: string | null
          max_travel_distance: number | null
          overall_rating: number | null
          phone_number: string | null
          phone_verification_code: string | null
          phone_verification_expires_at: string | null
          phone_verified: boolean | null
          preferred_contact: string | null
          profile_image_url: string | null
          total_games_played: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          auto_accept_invites?: boolean | null
          created_at?: string | null
          cricheroes_username?: string | null
          cricheroes_verified?: boolean | null
          full_name: string
          gender?: string | null
          id: string
          is_available?: boolean | null
          last_seen?: string | null
          location?: string | null
          max_travel_distance?: number | null
          overall_rating?: number | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_expires_at?: string | null
          phone_verified?: boolean | null
          preferred_contact?: string | null
          profile_image_url?: string | null
          total_games_played?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          auto_accept_invites?: boolean | null
          created_at?: string | null
          cricheroes_username?: string | null
          cricheroes_verified?: boolean | null
          full_name?: string
          gender?: string | null
          id?: string
          is_available?: boolean | null
          last_seen?: string | null
          location?: string | null
          max_travel_distance?: number | null
          overall_rating?: number | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_expires_at?: string | null
          phone_verified?: boolean | null
          preferred_contact?: string | null
          profile_image_url?: string | null
          total_games_played?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_sports_profiles: {
        Row: {
          batting_style: string | null
          bowling_style: string | null
          created_at: string | null
          experience_level: string | null
          id: string
          is_active: boolean | null
          playing_foot: string | null
          playing_style: Json | null
          preferred_positions: string[] | null
          skill_level: number | null
          sport: string
          user_id: string
        }
        Insert: {
          batting_style?: string | null
          bowling_style?: string | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          playing_foot?: string | null
          playing_style?: Json | null
          preferred_positions?: string[] | null
          skill_level?: number | null
          sport: string
          user_id: string
        }
        Update: {
          batting_style?: string | null
          bowling_style?: string | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          playing_foot?: string | null
          playing_style?: Json | null
          preferred_positions?: string[] | null
          skill_level?: number | null
          sport?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "customer" | "turf_owner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["customer", "turf_owner", "admin"],
    },
  },
} as const
