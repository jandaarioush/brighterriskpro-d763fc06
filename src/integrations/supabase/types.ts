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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          config: Json | null
          created_at: string
          icon: string | null
          id: string
          monthly_risk: number | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          monthly_risk?: number | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          monthly_risk?: number | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          name: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          name: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          paid_at: string | null
          product_id: string
          product_name: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          product_id: string
          product_name: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          product_id?: string
          product_name?: string
          status?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      pending_orders: {
        Row: {
          amount: number
          checkout_url: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          name: string
          order_nsu: string
          paid_at: string | null
          phone: string | null
          plano: string
          status: string
        }
        Insert: {
          amount: number
          checkout_url?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          name: string
          order_nsu: string
          paid_at?: string | null
          phone?: string | null
          plano: string
          status?: string
        }
        Update: {
          amount?: number
          checkout_url?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          name?: string
          order_nsu?: string
          paid_at?: string | null
          phone?: string | null
          plano?: string
          status?: string
        }
        Relationships: []
      }
      portfolio_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          portfolio_id: string
          preco: number
          quantidade: number
          ticker: string
          tipo: string
          user_id: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          notes?: string | null
          portfolio_id: string
          preco: number
          quantidade: number
          ticker: string
          tipo: string
          user_id: string
          valor_total: number
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          portfolio_id?: string
          preco?: number
          quantidade?: number
          ticker?: string
          tipo?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_entries_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          capital_atual: number
          capital_inicial: number
          created_at: string
          dashboard_id: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_atual?: number
          capital_inicial?: number
          created_at?: string
          dashboard_id: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_atual?: number
          capital_inicial?: number
          created_at?: string
          dashboard_id?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          infinitepay_order_nsu: string | null
          kiwify_customer_id: string | null
          kiwify_order_id: string | null
          last_paid_at: string | null
          monthly_risk: number | null
          name: string | null
          phone: string | null
          plano: string | null
          state: string | null
          status_pagamento: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id: string
          infinitepay_order_nsu?: string | null
          kiwify_customer_id?: string | null
          kiwify_order_id?: string | null
          last_paid_at?: string | null
          monthly_risk?: number | null
          name?: string | null
          phone?: string | null
          plano?: string | null
          state?: string | null
          status_pagamento?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          infinitepay_order_nsu?: string | null
          kiwify_customer_id?: string | null
          kiwify_order_id?: string | null
          last_paid_at?: string | null
          monthly_risk?: number | null
          name?: string | null
          phone?: string | null
          plano?: string | null
          state?: string | null
          status_pagamento?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_trades: {
        Row: {
          alavancagem: number
          capital_utilizado: number
          corretagem: number | null
          created_at: string
          dashboard_id: string
          id: string
          modalidade: string
          nota_disciplina: number | null
          notes: string | null
          preco_entrada: number
          preco_saida: number
          quantidade: number
          resultado_percentual: number
          resultado_reais: number
          risco_percentual: number
          screenshot_url: string | null
          setup_utilizado: string | null
          tag: string | null
          ticker: string
          trade_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alavancagem?: number
          capital_utilizado: number
          corretagem?: number | null
          created_at?: string
          dashboard_id: string
          id?: string
          modalidade: string
          nota_disciplina?: number | null
          notes?: string | null
          preco_entrada: number
          preco_saida: number
          quantidade: number
          resultado_percentual: number
          resultado_reais: number
          risco_percentual: number
          screenshot_url?: string | null
          setup_utilizado?: string | null
          tag?: string | null
          ticker: string
          trade_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alavancagem?: number
          capital_utilizado?: number
          corretagem?: number | null
          created_at?: string
          dashboard_id?: string
          id?: string
          modalidade?: string
          nota_disciplina?: number | null
          notes?: string | null
          preco_entrada?: number
          preco_saida?: number
          quantidade?: number
          resultado_percentual?: number
          resultado_reais?: number
          risco_percentual?: number
          screenshot_url?: string | null
          setup_utilizado?: string | null
          tag?: string | null
          ticker?: string
          trade_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_trades_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          email: string
          expires_at: string
          id: string
          order_nsu: string
          plano: string
          started_at: string
          status: string
          transaction_nsu: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          expires_at: string
          id?: string
          order_nsu: string
          plano: string
          started_at?: string
          status?: string
          transaction_nsu?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          order_nsu?: string
          plano?: string
          started_at?: string
          status?: string
          transaction_nsu?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          nota_disciplina: number | null
          notes: string | null
          result_points: number
          result_reais: number
          screenshot_url: string | null
          setup_utilizado: string | null
          tag: string | null
          trade_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          nota_disciplina?: number | null
          notes?: string | null
          result_points: number
          result_reais: number
          screenshot_url?: string | null
          setup_utilizado?: string | null
          tag?: string | null
          trade_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          nota_disciplina?: number | null
          notes?: string | null
          result_points?: number
          result_reais?: number
          screenshot_url?: string | null
          setup_utilizado?: string | null
          tag?: string | null
          trade_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          email: string | null
          error: string | null
          event: string
          id: string
          order_id: string | null
          processed_at: string | null
          provider: string
          raw_payload: Json
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          error?: string | null
          event: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          provider?: string
          raw_payload: Json
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          error?: string | null
          event?: string
          id?: string
          order_id?: string | null
          processed_at?: string | null
          provider?: string
          raw_payload?: Json
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_webhook_processed: {
        Args: { p_event: string; p_order_id: string }
        Returns: boolean
      }
      cleanup_expired_reset_codes: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit: {
        Args: { p_action: string; p_actor: string; p_meta: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
