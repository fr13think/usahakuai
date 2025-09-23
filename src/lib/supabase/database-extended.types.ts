// Extended database types for new AI features
// This extends the existing database.types.ts with new table definitions

export interface BrandIdentity {
  id: string;
  user_id: string;
  business_description: string;
  business_type: string | null;
  logo_url: string | null;
  logo_prompt: string | null;
  brand_personality: string[] | null;
  visual_style: string | null;
  target_mood: string | null;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
  } | null;
  typography: {
    headline: string;
    body: string;
    display: string;
  } | null;
  mockups: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MarketIntelligence {
  id: string;
  user_id: string;
  industry: string;
  insights: Array<{
    id: string;
    title: string;
    summary: string;
    impact: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
    timestamp: string;
    actionable: string[];
  }>;
  metrics: {
    usdIdr: {
      rate: number;
      change: number;
      trend: 'up' | 'down';
    };
    stockIndex: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    inflation: {
      rate: number;
      change: number;
    };
    interests: {
      rate: number;
      change: number;
    };
  } | null;
  competitors: Array<{
    company: string;
    news: string;
    impact: string;
    opportunity: string;
    threat: string;
  }> | null;
  data_freshness: {
    news: 'fresh' | 'limited';
    economic: 'available' | 'unavailable';
    analysis: string;
  } | null;
  generated_at: string;
  expires_at: string;
  created_at: string;
}

export interface BusinessSimulation {
  id: string;
  user_id: string;
  business_type: string;
  quarter: number;
  year: number;
  cash: number;
  score: number;
  current_metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    marketShare: number;
    customerSatisfaction: number;
    employeeMotivation: number;
    riskLevel: number;
  };
  metrics_history: Array<{
    revenue: number;
    expenses: number;
    profit: number;
    marketShare: number;
    customerSatisfaction: number;
    employeeMotivation: number;
    riskLevel: number;
  }>;
  is_running: boolean;
  game_over: boolean;
  current_event: {
    id: string;
    title: string;
    description: string;
    type: 'market' | 'competitor' | 'economic' | 'internal';
    impact: 'high' | 'medium' | 'low';
    choices: Array<{
      id: string;
      text: string;
      description: string;
      cost: number;
      expectedOutcome: {
        revenue: number;
        expenses: number;
        marketShare: number;
        customerSatisfaction: number;
        employeeMotivation: number;
        riskLevel: number;
      };
    }>;
  } | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface SimulationEventLog {
  id: string;
  simulation_id: string;
  user_id: string;
  quarter: number;
  event_type: 'decision' | 'time_advance' | 'random_event';
  event_data: Record<string, unknown>;
  choice_made: string | null;
  choice_cost: number | null;
  metrics_before: Record<string, unknown> | null;
  metrics_after: Record<string, unknown> | null;
  created_at: string;
}

// Database functions return types
export interface GetLatestBrandIdentityResult {
  id: string;
  user_id: string;
  business_description: string;
  business_type: string | null;
  logo_url: string | null;
  brand_personality: string[] | null;
  color_palette: Record<string, string> | null;
  created_at: string;
}

export interface GetActiveSimulationResult {
  id: string;
  user_id: string;
  business_type: string;
  quarter: number;
  cash: number;
  score: number;
  current_metrics: Record<string, unknown>;
  is_running: boolean;
  game_over: boolean;
}

export interface SimulationLeaderboardResult {
  rank: number;
  user_id: string;
  business_type: string;
  score: number;
  quarters_survived: number;
  completed_at: string | null;
}

// Extended database interface
export interface ExtendedDatabase {
  brand_identities: {
    Row: BrandIdentity;
    Insert: Omit<BrandIdentity, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<BrandIdentity, 'id' | 'user_id' | 'created_at'>>;
  };
  market_intelligence: {
    Row: MarketIntelligence;
    Insert: Omit<MarketIntelligence, 'id' | 'generated_at' | 'expires_at' | 'created_at'> & {
      id?: string;
      generated_at?: string;
      expires_at?: string;
      created_at?: string;
    };
    Update: Partial<Omit<MarketIntelligence, 'id' | 'user_id' | 'created_at'>>;
  };
  business_simulations: {
    Row: BusinessSimulation;
    Insert: Omit<BusinessSimulation, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Omit<BusinessSimulation, 'id' | 'user_id' | 'created_at'>>;
  };
  simulation_events_log: {
    Row: SimulationEventLog;
    Insert: Omit<SimulationEventLog, 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<Omit<SimulationEventLog, 'id' | 'simulation_id' | 'user_id' | 'created_at'>>;
  };
}