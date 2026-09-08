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
      activity_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          detail: string | null
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          title: string
          workspace_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          title: string
          workspace_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          created_at: string
          document_type: string
          endorsements: string[]
          expiration_warning_days: number
          id: string
          minimum_limit: number | null
          name: string
          project_id: string | null
          status: Database["public"]["Enums"]["requirement_status"]
          trade: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          endorsements?: string[]
          expiration_warning_days?: number
          id?: string
          minimum_limit?: number | null
          name: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          trade?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          endorsements?: string[]
          expiration_warning_days?: number
          id?: string
          minimum_limit?: number | null
          name?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          trade?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_requirements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requests: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          doc_type: string
          due_date: string | null
          expiration_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          last_requested_at: string | null
          next_reminder_at: string | null
          notes: string | null
          owner_id: string
          project_id: string | null
          rejection_reason: string | null
          requirement_id: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["doc_status"]
          subcontractor_id: string
          submitted_at: string | null
          token: string
          token_expires_at: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string
          doc_type: string
          due_date?: string | null
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          last_requested_at?: string | null
          next_reminder_at?: string | null
          notes?: string | null
          owner_id: string
          project_id?: string | null
          rejection_reason?: string | null
          requirement_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          subcontractor_id: string
          submitted_at?: string | null
          token: string
          token_expires_at?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string
          doc_type?: string
          due_date?: string | null
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          last_requested_at?: string | null
          next_reminder_at?: string | null
          notes?: string | null
          owner_id?: string
          project_id?: string | null
          rejection_reason?: string | null
          requirement_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          subcontractor_id?: string
          submitted_at?: string | null
          token?: string
          token_expires_at?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          connected_at: string | null
          connected_by: string | null
          created_at: string
          id: string
          provider: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          provider: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string
          id?: string
          provider?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_applications: {
        Row: {
          biggest_problem: string | null
          company: string
          contacted_at: string | null
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          notes: string | null
          phone: string | null
          state: string | null
          status: string
          subcontractor_count: string | null
          tracking_method: string | null
          work_email: string
        }
        Insert: {
          biggest_problem?: string | null
          company: string
          contacted_at?: string | null
          created_at?: string
          full_name: string
          id?: string
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          subcontractor_count?: string | null
          tracking_method?: string | null
          work_email: string
        }
        Update: {
          biggest_problem?: string | null
          company?: string
          contacted_at?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          subcontractor_count?: string | null
          tracking_method?: string | null
          work_email?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_subcontractors: {
        Row: {
          created_at: string
          id: string
          planned_start_date: string | null
          project_id: string
          subcontractor_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          planned_start_date?: string | null
          project_id: string
          subcontractor_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          planned_start_date?: string | null
          project_id?: string
          subcontractor_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_subcontractors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subcontractors_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subcontractors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_events: {
        Row: {
          created_at: string
          created_by: string | null
          document_request_id: string | null
          id: string
          recipient_email: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_request_id?: string | null
          id?: string
          recipient_email: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_request_id?: string | null
          id?: string
          recipient_email?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_events_document_request_id_fkey"
            columns: ["document_request_id"]
            isOneToOne: false
            referencedRelation: "document_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          company: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          owner_id: string
          project: string | null
          trade: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          company: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          owner_id: string
          project?: string | null
          trade?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          company?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          project?: string | null
          trade?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontractors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      doc_status: "pending" | "submitted" | "approved" | "rejected"
      project_status: "planning" | "active" | "on_hold" | "complete"
      requirement_status: "required" | "waived"
      workspace_role:
        | "owner"
        | "admin"
        | "project_manager"
        | "reviewer"
        | "read_only"
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
    Enums: {
      doc_status: ["pending", "submitted", "approved", "rejected"],
      project_status: ["planning", "active", "on_hold", "complete"],
      requirement_status: ["required", "waived"],
      workspace_role: [
        "owner",
        "admin",
        "project_manager",
        "reviewer",
        "read_only",
      ],
    },
  },
} as const
