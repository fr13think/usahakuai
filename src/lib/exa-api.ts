/**
 * Exa API integration for real-time market intelligence and web search
 * https://docs.exa.ai/
 */

interface ExaSearchOptions {
  query: string;
  type?: 'neural' | 'keyword' | 'auto';
  useAutoprompt?: boolean;
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeText?: boolean;
  includeSummary?: boolean;
  category?: string;
  language?: string;
}

interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  summary?: string;
  highlights?: string[];
}

interface ExaResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
  requestId: string;
}

interface MarketIntelligence {
  query: string;
  marketTrends: ExaSearchResult[];
  competitorAnalysis: ExaSearchResult[];
  industryNews: ExaSearchResult[];
  regulations: ExaSearchResult[];
  opportunities: ExaSearchResult[];
  summary: string;
  lastUpdated: string;
}

class ExaAPI {
  private apiKey: string;
  private baseUrl = 'https://api.exa.ai';

  constructor() {
    this.apiKey = process.env.EXA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('EXA_API_KEY not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, payload: Record<string, unknown>): Promise<ExaResponse> {
    if (!this.apiKey) {
      throw new Error('Exa API key is not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Exa API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async search(options: ExaSearchOptions): Promise<ExaResponse> {
    const payload: Record<string, unknown> = {
      query: options.query,
      type: options.type || 'auto',
      useAutoprompt: options.useAutoprompt || false,
      numResults: Math.min(options.numResults || 10, 20), // Limit to 20 max
      category: options.category,
    };

    // Only add optional fields if they have values
    if (options.includeDomains && options.includeDomains.length > 0) {
      payload.includeDomains = options.includeDomains;
    }
    if (options.excludeDomains && options.excludeDomains.length > 0) {
      payload.excludeDomains = options.excludeDomains;
    }
    if (options.startCrawlDate) {
      payload.startCrawlDate = options.startCrawlDate;
    }
    if (options.endCrawlDate) {
      payload.endCrawlDate = options.endCrawlDate;
    }
    if (options.startPublishedDate) {
      payload.startPublishedDate = options.startPublishedDate;
    }
    if (options.endPublishedDate) {
      payload.endPublishedDate = options.endPublishedDate;
    }
    if (options.language) {
      payload.language = options.language;
    }

    return this.makeRequest('/search', payload);
  }

  async getMarketIntelligence(businessQuery: string, industry?: string): Promise<MarketIntelligence> {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getTime() - (180 * 24 * 60 * 60 * 1000));
    
    const baseConfig = {
      startPublishedDate: sixMonthsAgo.toISOString().split('T')[0],
      endPublishedDate: currentDate.toISOString().split('T')[0],
      type: 'auto' as const,
      useAutoprompt: true
    };

    // Realistic search queries with varied result counts
    const searchQueries = [
      // Market trends - fewer but quality results
      {
        ...baseConfig,
        numResults: 5,
        query: `${businessQuery} Indonesia market trends 2025`,
        category: 'market trends'
      },
      
      // Competitor analysis - moderate results
      {
        ...baseConfig,
        numResults: 4,
        query: `${businessQuery} competitors Indonesia business analysis`, 
        category: 'competitor analysis'
      },
      
      // Industry news - more results available
      {
        ...baseConfig,
        numResults: 6,
        query: `${businessQuery} ${industry || ''} industry news Indonesia`,
        category: 'industry news'
      },
      
      // Regulations - fewer, specific results
      {
        ...baseConfig,
        numResults: 5,
        query: `${businessQuery} Indonesia government regulation policy`,
        category: 'regulations'
      },
      
      // Business opportunities - moderate results
      {
        ...baseConfig,
        numResults: 5,
        query: `${businessQuery} Indonesia business opportunities investment`,
        category: 'opportunities'
      }
    ];

    const [marketTrends, competitorAnalysis, industryNews, regulations, opportunities] = await Promise.allSettled(
      searchQueries.map(query => this.search(query))
    );

    // Process results
    const getResults = (settled: PromiseSettledResult<ExaResponse>, category: string): ExaSearchResult[] => {
      if (settled.status === 'fulfilled') {
        return settled.value.results || [];
      } else {
        console.error(`${category} search failed:`, settled.reason);
        return [];
      }
    };

    const intelligence: MarketIntelligence = {
      query: businessQuery,
      marketTrends: getResults(marketTrends, 'Market Trends'),
      competitorAnalysis: getResults(competitorAnalysis, 'Competitor Analysis'),
      industryNews: getResults(industryNews, 'Industry News'),
      regulations: getResults(regulations, 'Regulations'),
      opportunities: getResults(opportunities, 'Opportunities'),
      summary: '', // Will be filled by AI analysis
      lastUpdated: new Date().toISOString()
    };
    

    return intelligence;
  }

  async searchCompetitors(businessType: string, location: string = 'Indonesia'): Promise<ExaSearchResult[]> {
    const query = `${businessType} ${location} kompetitor pesaing analisis pasar`;
    
    const response = await this.search({
      query,
      numResults: 10,
      includeDomains: ['crunchbase.com', 'linkedin.com', 'google.com', 'wikipedia.org'],
      language: 'id'
    });

    return response.results;
  }

  async getTrendingTopics(industry: string): Promise<ExaSearchResult[]> {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const query = `${industry} trending viral populer Indonesia 2024`;
    
    const response = await this.search({
      query,
      numResults: 8,
      startPublishedDate: oneWeekAgo.toISOString().split('T')[0],
      includeDomains: ['twitter.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'google.com'],
      language: 'id'
    });

    return response.results;
  }

  async getRegulationUpdates(businessType: string): Promise<ExaSearchResult[]> {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getTime() - (180 * 24 * 60 * 60 * 1000));
    
    const query = `${businessType} regulasi peraturan pemerintah Indonesia 2024 update`;
    
    const response = await this.search({
      query,
      numResults: 6,
      startPublishedDate: sixMonthsAgo.toISOString().split('T')[0],
      includeDomains: ['kemenkop.go.id', 'kemenperin.go.id', 'ojk.go.id', 'bi.go.id', 'pajak.go.id'],
      language: 'id'
    });

    return response.results;
  }
}

// Singleton instance
export const exaAPI = new ExaAPI();

// Type exports
export type { 
  ExaSearchOptions, 
  ExaSearchResult, 
  ExaResponse, 
  MarketIntelligence 
};