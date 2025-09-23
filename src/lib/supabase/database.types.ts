export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          business_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          business_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          business_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      business_plans: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          executive_summary: string | null
          company_description: string | null
          products_services: string | null
          market_analysis: string | null
          marketing_strategy: string | null
          management_team: string | null
          financial_plan: string | null
          appendix: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          executive_summary?: string | null
          company_description?: string | null
          products_services?: string | null
          market_analysis?: string | null
          marketing_strategy?: string | null
          management_team?: string | null
          financial_plan?: string | null
          appendix?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          executive_summary?: string | null
          company_description?: string | null
          products_services?: string | null
          market_analysis?: string | null
          marketing_strategy?: string | null
          management_team?: string | null
          financial_plan?: string | null
          appendix?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_insights: {
        Row: {
          id: string
          user_id: string | null
          revenue: number | null
          expenses: number | null
          assets: number | null
          liabilities: number | null
          market_trends: string | null
          business_goals: string | null
          cash_flow_analysis: string | null
          profitability_analysis: string | null
          investment_opportunities: string | null
          recommendations: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          revenue?: number | null
          expenses?: number | null
          assets?: number | null
          liabilities?: number | null
          market_trends?: string | null
          business_goals?: string | null
          cash_flow_analysis?: string | null
          profitability_analysis?: string | null
          investment_opportunities?: string | null
          recommendations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          revenue?: number | null
          expenses?: number | null
          assets?: number | null
          liabilities?: number | null
          market_trends?: string | null
          business_goals?: string | null
          cash_flow_analysis?: string | null
          profitability_analysis?: string | null
          investment_opportunities?: string | null
          recommendations?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      document_analyses: {
        Row: {
          id: string
          user_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          summary: string | null
          key_points: Json | null
          recommendations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          summary?: string | null
          key_points?: Json | null
          recommendations?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          summary?: string | null
          key_points?: Json | null
          recommendations?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          status: string | null
          priority: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      generated_contents: {
        Row: {
          id: string
          user_id: string
          file_name: string | null
          file_size: number | null
          title: string
          description: string
          hashtags: string[]
          content_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name?: string | null
          file_size?: number | null
          title: string
          description: string
          hashtags: string[]
          content_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string | null
          file_size?: number | null
          title?: string
          description?: string
          hashtags?: string[]
          content_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_contents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          item_name: string
          item_code: string | null
          category: string
          current_stock: number
          minimum_stock: number
          maximum_stock: number | null
          unit_cost: number
          unit_price: number | null
          supplier_name: string | null
          supplier_contact: string | null
          lead_time_days: number | null
          storage_location: string | null
          expiry_date: string | null
          last_restocked: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_name: string
          item_code?: string | null
          category: string
          current_stock: number
          minimum_stock: number
          maximum_stock?: number | null
          unit_cost: number
          unit_price?: number | null
          supplier_name?: string | null
          supplier_contact?: string | null
          lead_time_days?: number | null
          storage_location?: string | null
          expiry_date?: string | null
          last_restocked?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_name?: string
          item_code?: string | null
          category?: string
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number | null
          unit_cost?: number
          unit_price?: number | null
          supplier_name?: string | null
          supplier_contact?: string | null
          lead_time_days?: number | null
          storage_location?: string | null
          expiry_date?: string | null
          last_restocked?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_transactions: {
        Row: {
          id: string
          inventory_item_id: string | null
          transaction_type: string
          quantity: number
          transaction_date: string
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inventory_item_id?: string | null
          transaction_type: string
          quantity: number
          transaction_date?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string | null
          transaction_type?: string
          quantity?: number
          transaction_date?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      workforce_metrics: {
        Row: {
          id: string
          user_id: string | null
          metric_name: string
          metric_value: number
          metric_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          metric_name: string
          metric_value: number
          metric_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          metric_name?: string
          metric_value?: number
          metric_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      operational_metrics: {
        Row: {
          id: string
          user_id: string | null
          department: string
          process_name: string
          efficiency_rate: number | null
          cycle_time: number | null
          error_rate: number | null
          throughput: number | null
          capacity_utilization: number | null
          quality_score: number | null
          bottleneck_areas: string | null
          improvement_suggestions: string | null
          automation_level: string | null
          cost_per_unit: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          department: string
          process_name: string
          efficiency_rate?: number | null
          cycle_time?: number | null
          error_rate?: number | null
          throughput?: number | null
          capacity_utilization?: number | null
          quality_score?: number | null
          bottleneck_areas?: string | null
          improvement_suggestions?: string | null
          automation_level?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          department?: string
          process_name?: string
          efficiency_rate?: number | null
          cycle_time?: number | null
          error_rate?: number | null
          throughput?: number | null
          capacity_utilization?: number | null
          quality_score?: number | null
          bottleneck_areas?: string | null
          improvement_suggestions?: string | null
          automation_level?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      orchestration_decisions: {
        Row: {
          id: string
          user_id: string | null
          decision_type: string
          input_data: Json
          ai_recommendation: string
          impact_prediction: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          decision_type: string
          input_data: Json
          ai_recommendation: string
          impact_prediction?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          decision_type?: string
          input_data?: Json
          ai_recommendation?: string
          impact_prediction?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orchestration_decisions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_analyses: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          transactions: Json
          summary: Json
          insights: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          transactions: Json
          summary: Json
          insights: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          transactions?: Json
          summary?: Json
          insights?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_summaries: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_hash: string | null
          transactions: Json
          summary: Json
          insights: Json
          is_duplicate: boolean | null
          original_analysis_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_hash?: string | null
          transactions: Json
          summary: Json
          insights: Json
          is_duplicate?: boolean | null
          original_analysis_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_hash?: string | null
          transactions?: Json
          summary?: Json
          insights?: Json
          is_duplicate?: boolean | null
          original_analysis_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_summaries_original_analysis_id_fkey"
            columns: ["original_analysis_id"]
            isOneToOne: false
            referencedRelation: "financial_summaries"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: string
          agent_type: string
          user_query: string
          agent_response: string
          session_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_type: string
          user_query: string
          agent_response: string
          session_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_type?: string
          user_query?: string
          agent_response?: string
          session_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          messages: Json
          message_count: number | null
          user_message_count: number | null
          agent_message_count: number | null
          agents_used: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          messages?: Json
          message_count?: number | null
          user_message_count?: number | null
          agent_message_count?: number | null
          agents_used?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          messages?: Json
          message_count?: number | null
          user_message_count?: number | null
          agent_message_count?: number | null
          agents_used?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_audiobooks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          content: string
          audio_url: string | null
          duration_minutes: number | null
          is_favorite: boolean | null
          play_count: number | null
          last_played_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          content: string
          audio_url?: string | null
          duration_minutes?: number | null
          is_favorite?: boolean | null
          play_count?: number | null
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          content?: string
          audio_url?: string | null
          duration_minutes?: number | null
          is_favorite?: boolean | null
          play_count?: number | null
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_audiobooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_courses: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          content: string
          chapters: Json | null
          progress_percentage: number | null
          is_completed: boolean | null
          is_favorite: boolean | null
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          content: string
          chapters?: Json | null
          progress_percentage?: number | null
          is_completed?: boolean | null
          is_favorite?: boolean | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          content?: string
          chapters?: Json | null
          progress_percentage?: number | null
          is_completed?: boolean | null
          is_favorite?: boolean | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      brand_identities: {
        Row: {
          id: string
          user_id: string
          business_description: string
          business_type: string | null
          brand_personality: string[] | null
          color_palette: Json | null
          typography_suggestions: string[] | null
          logo_description: string | null
          logo_url: string | null
          mockup_urls: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_description: string
          business_type?: string | null
          brand_personality?: string[] | null
          color_palette?: Json | null
          typography_suggestions?: string[] | null
          logo_description?: string | null
          logo_url?: string | null
          mockup_urls?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_description?: string
          business_type?: string | null
          brand_personality?: string[] | null
          color_palette?: Json | null
          typography_suggestions?: string[] | null
          logo_description?: string | null
          logo_url?: string | null
          mockup_urls?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      market_intelligence: {
        Row: {
          id: string
          user_id: string
          industry: string
          location: string | null
          insights: Json | null
          metrics: Json | null
          competitors: Json | null
          data_freshness: Json | null
          generated_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          industry: string
          location?: string | null
          insights?: Json | null
          metrics?: Json | null
          competitors?: Json | null
          data_freshness?: Json | null
          generated_at?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          industry?: string
          location?: string | null
          insights?: Json | null
          metrics?: Json | null
          competitors?: Json | null
          data_freshness?: Json | null
          generated_at?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_intelligence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      business_simulations: {
        Row: {
          id: string
          user_id: string
          business_type: string
          quarter: number
          year: number
          cash: number
          score: number
          current_metrics: Json
          metrics_history: Json
          is_running: boolean
          game_over: boolean
          current_event: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          business_type: string
          quarter?: number
          year?: number
          cash?: number
          score?: number
          current_metrics?: Json
          metrics_history?: Json
          is_running?: boolean
          game_over?: boolean
          current_event?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          business_type?: string
          quarter?: number
          year?: number
          cash?: number
          score?: number
          current_metrics?: Json
          metrics_history?: Json
          is_running?: boolean
          game_over?: boolean
          current_event?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      simulation_events_log: {
        Row: {
          id: string
          simulation_id: string
          user_id: string
          quarter: number
          event_type: string
          event_data: Json | null
          choice_made: string | null
          choice_cost: number | null
          metrics_before: Json | null
          metrics_after: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          simulation_id: string
          user_id: string
          quarter?: number
          event_type: string
          event_data?: Json | null
          choice_made?: string | null
          choice_cost?: number | null
          metrics_before?: Json | null
          metrics_after?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          simulation_id?: string
          user_id?: string
          quarter?: number
          event_type?: string
          event_data?: Json | null
          choice_made?: string | null
          choice_cost?: number | null
          metrics_before?: Json | null
          metrics_after?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_events_log_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "business_simulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_events_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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