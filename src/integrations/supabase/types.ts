export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
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
          phone?: string | null
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
          phone?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "customer" | "turf_owner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
