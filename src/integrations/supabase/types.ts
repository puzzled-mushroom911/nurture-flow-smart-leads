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
      billing_events: {
        Row: {
          created_at: string
          credits_used: number
          details: Json | null
          event_type: string
          id: string
          installation_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          details?: Json | null
          event_type: string
          id?: string
          installation_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          details?: Json | null
          event_type?: string
          id?: string
          installation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "ghl_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_installations: {
        Row: {
          access_token: string
          company_id: string
          created_at: string
          id: string
          location_id: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          access_token: string
          company_id: string
          created_at?: string
          id?: string
          location_id: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          company_id?: string
          created_at?: string
          id?: string
          location_id?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          id: string
          installation_id: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          installation_id: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          installation_id?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "ghl_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          ghl_contact_id: string
          id: string
          installation_id: string
          last_activity: string | null
          last_name: string | null
          phone: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          ghl_contact_id: string
          id?: string
          installation_id: string
          last_activity?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          ghl_contact_id?: string
          id?: string
          installation_id?: string
          last_activity?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "ghl_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          approval_needed: boolean
          content: string
          created_at: string
          id: string
          lead_id: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approval_needed?: boolean
          content: string
          created_at?: string
          id?: string
          lead_id: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approval_needed?: boolean
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          installation_id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          processing_error: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          installation_id: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          installation_id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "ghl_installations"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
