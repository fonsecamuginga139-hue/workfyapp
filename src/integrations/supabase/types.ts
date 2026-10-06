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
      biosite_blocks: {
        Row: {
          appearance: Json
          biosite_id: string
          content: Json
          created_at: string
          enabled: boolean
          id: string
          owner_id: string
          position: number
          size: string
          type: string
          updated_at: string
        }
        Insert: {
          appearance?: Json
          biosite_id: string
          content?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          owner_id: string
          position?: number
          size?: string
          type: string
          updated_at?: string
        }
        Update: {
          appearance?: Json
          biosite_id?: string
          content?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          owner_id?: string
          position?: number
          size?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_blocks_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: false
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
        ]
      }
      biosite_bookings: {
        Row: {
          biosite_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          owner_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          biosite_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          owner_id: string
          scheduled_date: string
          scheduled_time: string
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          biosite_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          owner_id?: string
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_bookings_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: false
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biosite_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "biosite_services"
            referencedColumns: ["id"]
          },
        ]
      }
      biosite_deliveries: {
        Row: {
          access_key_hash: string
          biosite_id: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          delivered_at: string
          id: string
          key_hint: string
          key_rotated_at: string
          last_accessed_at: string | null
          owner_id: string
          permissions: Json
          status: string
          updated_at: string
        }
        Insert: {
          access_key_hash: string
          biosite_id: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          delivered_at?: string
          id?: string
          key_hint: string
          key_rotated_at?: string
          last_accessed_at?: string | null
          owner_id: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          access_key_hash?: string
          biosite_id?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          delivered_at?: string
          id?: string
          key_hint?: string
          key_rotated_at?: string
          last_accessed_at?: string | null
          owner_id?: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_deliveries_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: true
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biosite_deliveries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      biosite_delivery_history: {
        Row: {
          created_at: string
          delivery_id: string
          details: Json
          event_type: string
          id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          details?: Json
          event_type: string
          id?: string
          owner_id: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          details?: Json
          event_type?: string
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_delivery_history_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "biosite_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
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
      biosite_forms: {
        Row: {
          appearance: Json
          biosite_id: string
          created_at: string
          description: string
          enabled: boolean
          fields: Json
          id: string
          owner_id: string
          position: number
          submit_label: string
          title: string
          updated_at: string
        }
        Insert: {
          appearance?: Json
          biosite_id: string
          created_at?: string
          description?: string
          enabled?: boolean
          fields?: Json
          id?: string
          owner_id: string
          position?: number
          submit_label?: string
          title: string
          updated_at?: string
        }
        Update: {
          appearance?: Json
          biosite_id?: string
          created_at?: string
          description?: string
          enabled?: boolean
          fields?: Json
          id?: string
          owner_id?: string
          position?: number
          submit_label?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_forms_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: false
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
        ]
      }
      biosite_leads: {
        Row: {
          answers: Json
          biosite_id: string
          created_at: string
          email: string | null
          form_id: string | null
          id: string
          message: string | null
          name: string | null
          owner_id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          biosite_id: string
          created_at?: string
          email?: string | null
          form_id?: string | null
          id?: string
          message?: string | null
          name?: string | null
          owner_id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          biosite_id?: string
          created_at?: string
          email?: string | null
          form_id?: string | null
          id?: string
          message?: string | null
          name?: string | null
          owner_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_leads_biosite_id_fkey"
            columns: ["biosite_id"]
            isOneToOne: false
            referencedRelation: "biosites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biosite_leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "biosite_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      biosite_services: {
        Row: {
          available: boolean
          biosite_id: string
          category_id: string | null
          created_at: string
          cta_label: string
          cta_type: string
          description: string
          duration_minutes: number | null
          featured: boolean
          id: string
          media_type: string
          media_url: string | null
          name: string
          owner_id: string
          position: number
          price: number | null
          promotional_price: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean
          biosite_id: string
          category_id?: string | null
          created_at?: string
          cta_label?: string
          cta_type?: string
          description?: string
          duration_minutes?: number | null
          featured?: boolean
          id?: string
          media_type?: string
          media_url?: string | null
          name: string
          owner_id: string
          position?: number
          price?: number | null
          promotional_price?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean
          biosite_id?: string
          category_id?: string | null
          created_at?: string
          cta_label?: string
          cta_type?: string
          description?: string
          duration_minutes?: number | null
          featured?: boolean
          id?: string
          media_type?: string
          media_url?: string | null
          name?: string
          owner_id?: string
          position?: number
          price?: number | null
          promotional_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biosite_services_biosite_id_fkey"
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
          branding: Json
          catalog_categories: Json
          catalog_items: Json
          category: string
          completion_progress: number
          content_version: number
          cover_url: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sections: Json
          seo: Json
          short_description: string
          showcase_opt_in: boolean
          showcased_at: string | null
          slug: string
          social_links_data: Json
          status: string
          updated_at: string
          user_id: string
          views_count: number
          whatsapp_config: Json
        }
        Insert: {
          action_buttons_data?: Json
          appearance?: Json
          branding?: Json
          catalog_categories?: Json
          catalog_items?: Json
          category?: string
          completion_progress?: number
          content_version?: number
          cover_url?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sections?: Json
          seo?: Json
          short_description?: string
          showcase_opt_in?: boolean
          showcased_at?: string | null
          slug: string
          social_links_data?: Json
          status?: string
          updated_at?: string
          user_id: string
          views_count?: number
          whatsapp_config?: Json
        }
        Update: {
          action_buttons_data?: Json
          appearance?: Json
          branding?: Json
          catalog_categories?: Json
          catalog_items?: Json
          category?: string
          completion_progress?: number
          content_version?: number
          cover_url?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sections?: Json
          seo?: Json
          short_description?: string
          showcase_opt_in?: boolean
          showcased_at?: string | null
          slug?: string
          social_links_data?: Json
          status?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          whatsapp_config?: Json
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          updated_at?: string
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
      get_client_biosite: {
        Args: { p_key: string; p_slug: string }
        Returns: Json
      }
      get_public_biosite: { Args: { p_slug: string }; Returns: Json }
      is_slug_available: {
        Args: { p_exclude_id?: string; p_slug: string }
        Returns: boolean
      }
      list_public_biosites: { Args: { p_limit?: number }; Returns: Json }
      list_showcase_biosites: { Args: { p_limit?: number }; Returns: Json }
      rotate_biosite_access_key: {
        Args: {
          p_biosite_id: string
          p_client_id: string
          p_client_name: string
          p_client_phone?: string
        }
        Returns: string
      }
      submit_biosite_booking: {
        Args: {
          p_date: string
          p_email: string
          p_name: string
          p_notes?: string
          p_phone: string
          p_service_id: string
          p_slug: string
          p_time: string
        }
        Returns: string
      }
      submit_biosite_form: {
        Args: { p_form_id: string; p_payload: Json; p_slug: string }
        Returns: string
      }
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
