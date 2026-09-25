export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      biosite_events: {
        Row: {
          biosite_id: string
          created_at: string
          id: string
          label: string | null
          type: string
        }
        Insert: {
          biosite_id: string
          created_at?: string
          id?: string
          label?: string | null
          type: string
        }
        Update: {
          biosite_id?: string
          created_at?: string
          id?: string
          label?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_events_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: false
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
        ]
      }
      biosites: {
        Row: {
          action_buttons_data: Json
          appearance: Json
          catalog_categories: Json
          catalog_items: Json
          category: string
          client_name: string | null
          client_notes: string | null
          client_phone: string | null
          completion_progress: number
          cover_url: string | null
          created_at: string
          id: string
          logo_url: string | null
          monthly_fee: number | null
          name: string
          sale_price: number | null
          sale_status: string
          sections: Json
          short_description: string
          slug: string
          social_links_data: Json
          sold_date: string | null
          sold_price: number | null
          status: string
          updated_at: string
          user_id: string
          views_count: number
          whatsapp_config: Json
        }
        Insert: {
          action_buttons_data?: Json
          appearance?: Json
          catalog_categories?: Json
          catalog_items?: Json
          category?: string
          client_name?: string | null
          client_notes?: string | null
          client_phone?: string | null
          completion_progress?: number
          cover_url?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          sale_price?: number | null
          sale_status?: string
          sections?: Json
          short_description?: string
          slug: string
          social_links_data?: Json
          sold_date?: string | null
          sold_price?: number | null
          status?: string
          updated_at?: string
          user_id: string
          views_count?: number
          whatsapp_config?: Json
        }
        Update: {
          action_buttons_data?: Json
          appearance?: Json
          catalog_categories?: Json
          catalog_items?: Json
          category?: string
          client_name?: string | null
          client_notes?: string | null
          client_phone?: string | null
          completion_progress?: number
          cover_url?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          sale_price?: number | null
          sale_status?: string
          sections?: Json
          short_description?: string
          slug?: string
          social_links_data?: Json
          sold_date?: string | null
          sold_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          whatsapp_config?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_biosite_analytics: { Args: { p_biosite_id: string }; Returns: Json }
      get_public_biosite: { Args: { p_slug: string }; Returns: Json }
      is_slug_available: {
        Args: { p_exclude_id?: string; p_slug: string }
        Returns: boolean
      }
      list_public_biosites: { Args: { p_limit?: number }; Returns: Json }
      track_biosite_event: {
        Args: { p_label?: string; p_slug: string; p_type: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
