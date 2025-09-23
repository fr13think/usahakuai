/**
 * Multi-Agent AI System for Business Intelligence
 * Each agent has specialized knowledge and capabilities
 */

import { exaAPI } from './exa-api';
import type Groq from 'groq-sdk';

// Groq client will be initialized server-side only in API routes

export interface AgentContext {
  userQuery: string;
  conversationHistory?: ChatMessage[];
  documentContext?: string[];
  webSearchResults?: Array<{ title: string; url: string; summary?: string; }>;
  userProfile?: {
    businessType?: string;
    industry?: string;
    experience?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  agentType?: AgentType;
  timestamp: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    handoffReason?: string;
  };
}

export enum AgentType {
  BUSINESS_STRATEGY = 'business-strategy',
  FINANCIAL_ADVISOR = 'financial-advisor', 
  MARKET_ANALYST = 'market-analyst',
  RISK_ASSESSOR = 'risk-assessor',
  LEARNING_CURATOR = 'learning-curator'
}

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  expertise: string[];
  color: string;
  icon: string;
  systemPrompt: string;
  shouldHandle: (query: string, context?: AgentContext) => boolean;
  process: (context: AgentContext, groqClient?: Groq) => Promise<{
    response: string;
    sources: string[];
    confidence: number;
    handoffTo?: AgentType;
    handoffReason?: string;
  }>;
}

// Business Strategy Agent
const businessStrategyAgent: Agent = {
  type: AgentType.BUSINESS_STRATEGY,
  name: 'Ahli Strategi Bisnis',
  description: 'Spesialis dalam perencanaan strategis, model bisnis, dan growth hacking',
  expertise: ['Business Planning', 'Strategic Analysis', 'Growth Strategy', 'Competitive Positioning'],
  color: 'blue',
  icon: 'Target',
  systemPrompt: `Anda adalah Ahli Strategi Bisnis berpengalaman dengan keahlian mendalam dalam:
- Perencanaan strategis dan eksekusi
- Analisis model bisnis dan value proposition
- Growth hacking dan scaling strategy
- Competitive positioning dan market entry
- Business transformation dan inovasi

Berikan saran yang praktis, actionable, dan berbasis data. Gunakan framework bisnis yang terbukti seperti Business Model Canvas, Porter's Five Forces, atau OKR. Fokus pada strategi yang dapat diimplementasikan di pasar Indonesia.`,
  
  shouldHandle: (query: string) => {
    const strategyKeywords = [
      'strategi', 'strategy', 'perencanaan', 'planning', 'bisnis', 'business',
      'model bisnis', 'business model', 'growth', 'pertumbuhan', 'ekspansi',
      'scaling', 'kompetitor', 'competitor', 'positioning', 'market entry',
      'value proposition', 'canvas', 'framework', 'roadmap'
    ];
    return strategyKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  },
  
  process: async (context: AgentContext, groqClient?: Groq) => {
    try {
      // Get market intelligence if relevant
      let webContext = '';
      if (context.userProfile?.businessType) {
        try {
          const marketIntelligence = await exaAPI.getMarketIntelligence(
            context.userProfile.businessType,
            context.userProfile.industry
          );
          const trends = marketIntelligence.marketTrends.slice(0, 3);
          const competitors = marketIntelligence.competitorAnalysis.slice(0, 2);
          
          webContext = `
MARKET INTELLIGENCE:
Trends: ${trends.map(t => `${t.title}: ${t.summary}`).join('; ')}
Competitors: ${competitors.map(c => `${c.title}: ${c.summary}`).join('; ')}
`;
        } catch (error) {
          console.error('Market intelligence error:', error);
        }
      }

      const prompt = `${businessStrategyAgent.systemPrompt}

CONTEXT:
${webContext}
${context.documentContext ? `Documents: ${context.documentContext.join('; ')}` : ''}
${context.conversationHistory ? `Previous conversation: ${context.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\\n')}` : ''}

USER QUERY: ${context.userQuery}

Berikan analisis strategis yang komprehensif dengan:
1. Analisis situasi saat ini
2. Rekomendasi strategis yang spesifik
3. Langkah implementasi yang praktis
4. Metrics untuk mengukur kesuksesan

Format response dalam bahasa Indonesia yang profesional dan mudah dipahami.`;

      if (!groqClient) {
        throw new Error('Groq client not available');
      }

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: businessStrategyAgent.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan respons saat ini.';
      
      return {
        response,
        sources: webContext ? ['Market Intelligence', 'Real-time Data'] : [],
        confidence: 0.85,
      };

    } catch (error) {
      console.error('Business Strategy Agent error:', error);
      return {
        response: 'Maaf, terjadi kesalahan dalam memproses permintaan strategi bisnis Anda. Silakan coba lagi.',
        sources: [],
        confidence: 0.1,
      };
    }
  }
};

// Financial Advisor Agent
const financialAdvisorAgent: Agent = {
  type: AgentType.FINANCIAL_ADVISOR,
  name: 'Penasihat Keuangan',
  description: 'Ahli dalam perencanaan keuangan, investasi, dan manajemen cash flow',
  expertise: ['Financial Planning', 'Investment Strategy', 'Cash Flow Management', 'Financial Analysis'],
  color: 'green',
  icon: 'DollarSign',
  systemPrompt: `Anda adalah Penasihat Keuangan profesional dengan spesialisasi dalam:
- Perencanaan keuangan bisnis dan personal
- Analisis investasi dan portfolio management
- Cash flow management dan budgeting
- Financial risk assessment
- Tax planning dan compliance

Berikan advice yang konservatif namun growth-oriented. Pertimbangkan kondisi ekonomi Indonesia, regulasi yang berlaku, dan profil risiko yang sesuai. Selalu sertakan disclaimer dan anjuran konsultasi dengan ahli keuangan berlisensi.`,
  
  shouldHandle: (query: string) => {
    const financeKeywords = [
      'keuangan', 'finance', 'finansial', 'uang', 'money', 'investasi',
      'investment', 'modal', 'capital', 'cash flow', 'budgeting', 'budget',
      'profit', 'keuntungan', 'rugi', 'loss', 'pendapatan', 'revenue',
      'biaya', 'cost', 'expense', 'loan', 'pinjaman', 'kredit', 'pajak', 'tax'
    ];
    return financeKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  },
  
  process: async (context: AgentContext, groqClient?: Groq) => {
    try {
      const prompt = `${financialAdvisorAgent.systemPrompt}

CONTEXT:
${context.documentContext ? `Financial Documents: ${context.documentContext.join('; ')}` : ''}
${context.conversationHistory ? `Previous discussion: ${context.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\\n')}` : ''}

USER QUERY: ${context.userQuery}

Berikan analisis keuangan yang mencakup:
1. Assessment kondisi keuangan saat ini (jika ada data)
2. Rekomendasi finansial yang spesifik
3. Strategi pengelolaan risiko keuangan
4. Action items yang dapat diimplementasikan
5. Disclaimer dan saran konsultasi lanjutan

PENTING: Selalu sertakan disclaimer bahwa ini adalah saran umum dan bukan nasihat investasi personal.`;

      if (!groqClient) {
        throw new Error('Groq client not available');
      }

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: financialAdvisorAgent.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan respons keuangan saat ini.';
      
      return {
        response,
        sources: context.documentContext ? ['Financial Documents', 'Historical Data'] : [],
        confidence: 0.80,
      };

    } catch (error) {
      console.error('Financial Advisor Agent error:', error);
      return {
        response: 'Maaf, terjadi kesalahan dalam memproses konsultasi keuangan Anda. Silakan coba lagi.',
        sources: [],
        confidence: 0.1,
      };
    }
  }
};

// Market Analyst Agent  
const marketAnalystAgent: Agent = {
  type: AgentType.MARKET_ANALYST,
  name: 'Analis Pasar',
  description: 'Spesialis dalam riset pasar, analisis tren, dan consumer behavior',
  expertise: ['Market Research', 'Trend Analysis', 'Consumer Behavior', 'Competitive Intelligence'],
  color: 'purple',
  icon: 'TrendingUp',
  systemPrompt: `Anda adalah Analis Pasar senior dengan keahlian dalam:
- Market research dan data analysis
- Trend forecasting dan pattern recognition
- Consumer behavior dan psychology
- Competitive intelligence dan benchmarking
- Market sizing dan opportunity assessment

Berikan insights yang data-driven dan actionable. Gunakan metodologi riset yang solid dan referensikan sumber data yang credible. Fokus pada pasar Indonesia dengan pemahaman mendalam tentang consumer behavior lokal.`,
  
  shouldHandle: (query: string) => {
    const marketKeywords = [
      'pasar', 'market', 'tren', 'trend', 'konsumen', 'customer', 'consumer',
      'riset', 'research', 'analisis pasar', 'market analysis', 'segmentasi',
      'segmentation', 'target market', 'demografi', 'demographic', 'behavior',
      'perilaku', 'survey', 'data', 'insights', 'opportunity', 'peluang'
    ];
    return marketKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  },
  
  process: async (context: AgentContext, groqClient?: Groq) => {
    try {
      // Conduct web search for market data
      let marketData = '';
      try {
        const searchQuery = `${context.userQuery} Indonesia market research trend 2024`;
        const webResults = await exaAPI.search({
          query: searchQuery,
          numResults: 5,
          type: 'auto',
          useAutoprompt: true
        });
        
        marketData = webResults.results.slice(0, 3).map(r => 
          `${r.title}: ${r.summary || 'Data tersedia'}`
        ).join('; ');
      } catch (error) {
        console.error('Market search error:', error);
      }

      const prompt = `${marketAnalystAgent.systemPrompt}

CONTEXT:
${marketData ? `Latest Market Data: ${marketData}` : ''}
${context.documentContext ? `Internal Data: ${context.documentContext.join('; ')}` : ''}
${context.conversationHistory ? `Previous analysis: ${context.conversationHistory.slice(-2).map(m => `${m.role}: ${m.content}`).join('\\n')}` : ''}

USER QUERY: ${context.userQuery}

Berikan analisis pasar yang comprehensive:
1. Market overview dan current state
2. Key trends dan drivers
3. Consumer insights dan behavior patterns
4. Competitive landscape analysis
5. Market opportunities dan recommendations
6. Data sources dan metodologi yang digunakan

Sertakan data dan statistik yang relevan jika tersedia.`;

      if (!groqClient) {
        throw new Error('Groq client not available');
      }

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: marketAnalystAgent.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan analisis pasar saat ini.';
      
      return {
        response,
        sources: marketData ? ['Market Research', 'Real-time Data', 'Web Intelligence'] : [],
        confidence: 0.82,
      };

    } catch (error) {
      console.error('Market Analyst Agent error:', error);
      return {
        response: 'Maaf, terjadi kesalahan dalam memproses analisis pasar Anda. Silakan coba lagi.',
        sources: [],
        confidence: 0.1,
      };
    }
  }
};

// Risk Assessor Agent
const riskAssessorAgent: Agent = {
  type: AgentType.RISK_ASSESSOR,
  name: 'Penilai Risiko',
  description: 'Ahli dalam identifikasi, analisis, dan mitigasi risiko bisnis',
  expertise: ['Risk Assessment', 'Risk Management', 'Compliance', 'Crisis Management'],
  color: 'red',
  icon: 'AlertTriangle',
  systemPrompt: `Anda adalah Penilai Risiko profesional dengan spesialisasi dalam:
- Risk identification dan assessment
- Risk management dan mitigation strategies  
- Regulatory compliance dan legal risk
- Operational risk dan business continuity
- Financial risk dan market volatility
- Crisis management dan contingency planning

Berikan assessment yang objektif dan comprehensive. Prioritaskan risiko berdasarkan probability dan impact. Selalu sertakan strategi mitigasi yang praktis dan cost-effective. Pertimbangkan konteks bisnis Indonesia dan regulatory environment.`,
  
  shouldHandle: (query: string) => {
    const riskKeywords = [
      'risiko', 'risk', 'bahaya', 'danger', 'ancaman', 'threat', 'masalah',
      'problem', 'krisis', 'crisis', 'keamanan', 'security', 'compliance',
      'regulasi', 'regulation', 'legal', 'hukum', 'audit', 'control',
      'mitigasi', 'mitigation', 'kontinjensi', 'contingency'
    ];
    return riskKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  },
  
  process: async (context: AgentContext, groqClient?: Groq) => {
    try {
      // Search for regulatory and compliance information
      let regulatoryInfo = '';
      if (context.userProfile?.businessType) {
        try {
          const regResults = await exaAPI.search({
            query: `${context.userProfile.businessType} Indonesia regulation compliance risk 2024`,
            numResults: 3,
            type: 'auto'
          });
          
          regulatoryInfo = regResults.results.slice(0, 2).map(r => 
            `${r.title}: ${r.summary || 'Regulatory information available'}`
          ).join('; ');
        } catch (error) {
          console.error('Regulatory search error:', error);
        }
      }

      const prompt = `${riskAssessorAgent.systemPrompt}

CONTEXT:
${regulatoryInfo ? `Regulatory Context: ${regulatoryInfo}` : ''}
${context.documentContext ? `Internal Risk Data: ${context.documentContext.join('; ')}` : ''}
${context.conversationHistory ? `Previous risk discussion: ${context.conversationHistory.slice(-2).map(m => `${m.role}: ${m.content}`).join('\\n')}` : ''}

USER QUERY: ${context.userQuery}

Berikan risk assessment yang detailed:
1. Risk identification dan categorization
2. Risk probability dan impact analysis
3. Current risk controls assessment
4. Risk mitigation strategies dan recommendations
5. Monitoring dan review mechanisms
6. Regulatory compliance considerations
7. Contingency planning recommendations

Prioritaskan risiko berdasarkan tingkat keparahan dan kemungkinan terjadinya.`;

      if (!groqClient) {
        throw new Error('Groq client not available');
      }

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: riskAssessorAgent.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan penilaian risiko saat ini.';
      
      return {
        response,
        sources: regulatoryInfo ? ['Regulatory Database', 'Compliance Data', 'Risk Intelligence'] : [],
        confidence: 0.78,
      };

    } catch (error) {
      console.error('Risk Assessor Agent error:', error);
      return {
        response: 'Maaf, terjadi kesalahan dalam memproses penilaian risiko Anda. Silakan coba lagi.',
        sources: [],
        confidence: 0.1,
      };
    }
  }
};

// Learning Curator Agent
const learningCuratorAgent: Agent = {
  type: AgentType.LEARNING_CURATOR,
  name: 'Kurator Pembelajaran',
  description: 'Spesialis dalam pengembangan skill, training, dan knowledge management',
  expertise: ['Skill Development', 'Training Programs', 'Knowledge Management', 'Learning Strategies'],
  color: 'indigo',
  icon: 'BookOpen',
  systemPrompt: `Anda adalah Kurator Pembelajaran dengan keahlian dalam:
- Learning and development strategy
- Skill gap analysis dan training needs assessment
- Curriculum design dan learning path creation
- Knowledge management dan best practices
- Adult learning principles dan pedagogy
- Performance improvement dan competency development

Berikan rekomendasi pembelajaran yang practical dan outcome-focused. Pertimbangkan learning styles yang berbeda dan accessibility. Fokus pada skill yang relevan dengan perkembangan bisnis dan teknologi di Indonesia.`,
  
  shouldHandle: (query: string) => {
    const learningKeywords = [
      'belajar', 'learning', 'pembelajaran', 'training', 'pelatihan',
      'skill', 'kemampuan', 'ability', 'kompetensi', 'competency',
      'kursus', 'course', 'sertifikasi', 'certification', 'workshop',
      'development', 'pengembangan', 'knowledge', 'pengetahuan',
      'edukasi', 'education', 'mentor', 'coaching'
    ];
    return learningKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  },
  
  process: async (context: AgentContext, groqClient?: Groq) => {
    try {
      // Search for learning resources and trends
      let learningResources = '';
      try {
        const learningResults = await exaAPI.search({
          query: `${context.userQuery} Indonesia online learning course training 2024`,
          numResults: 4,
          type: 'auto'
        });
        
        learningResources = learningResults.results.slice(0, 3).map(r => 
          `${r.title}: ${r.summary || 'Learning resource available'}`
        ).join('; ');
      } catch (error) {
        console.error('Learning search error:', error);
      }

      const prompt = `${learningCuratorAgent.systemPrompt}

CONTEXT:
${learningResources ? `Available Learning Resources: ${learningResources}` : ''}
${context.userProfile ? `User Profile: Business: ${context.userProfile.businessType}, Industry: ${context.userProfile.industry}, Experience: ${context.userProfile.experience}` : ''}
${context.conversationHistory ? `Learning history: ${context.conversationHistory.slice(-2).map(m => `${m.role}: ${m.content}`).join('\\n')}` : ''}

USER QUERY: ${context.userQuery}

Berikan learning recommendation yang comprehensive:
1. Learning needs assessment
2. Recommended learning path dan milestones
3. Specific courses, resources, dan materials
4. Learning methods dan best practices
5. Skills assessment dan progress tracking
6. Implementation timeline dan action steps
7. Budget considerations dan ROI expectations

Prioritaskan learning yang practical dan immediately applicable.`;

      if (!groqClient) {
        throw new Error('Groq client not available');
      }

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: learningCuratorAgent.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan rekomendasi pembelajaran saat ini.';
      
      return {
        response,
        sources: learningResources ? ['Learning Platforms', 'Course Databases', 'Educational Resources'] : [],
        confidence: 0.83,
      };

    } catch (error) {
      console.error('Learning Curator Agent error:', error);
      return {
        response: 'Maaf, terjadi kesalahan dalam memproses rekomendasi pembelajaran Anda. Silakan coba lagi.',
        sources: [],
        confidence: 0.1,
      };
    }
  }
};

// Agent Registry
export const agents: Agent[] = [
  businessStrategyAgent,
  financialAdvisorAgent,
  marketAnalystAgent,
  riskAssessorAgent,
  learningCuratorAgent
];

// Agent Router - determines which agent should handle the query
export class AgentRouter {
  static async route(context: AgentContext): Promise<Agent> {
    const query = context.userQuery.toLowerCase();
    
    // Check each agent's shouldHandle method
    for (const agent of agents) {
      if (agent.shouldHandle(query, context)) {
        return agent;
      }
    }
    
    // Fallback to business strategy agent if no specific match
    return businessStrategyAgent;
  }
  
  static async processWithAgent(agentType: AgentType, context: AgentContext, groqClient?: Groq) {
    const agent = agents.find(a => a.type === agentType);
    if (!agent) {
      throw new Error(`Agent ${agentType} not found`);
    }
    
    return await agent.process(context, groqClient);
  }
}

// Example questions for each agent type
export const exampleQuestions = {
  [AgentType.BUSINESS_STRATEGY]: [
    "Bagaimana cara mengembangkan strategi ekspansi untuk bisnis F&B saya?",
    "Apa model bisnis yang tepat untuk startup teknologi?",
    "Bagaimana cara melakukan pivot strategy yang efektif?",
    "Strategi apa untuk menghadapi kompetitor besar?",
    "Bagaimana membuat roadmap pertumbuhan 3 tahun?"
  ],
  [AgentType.FINANCIAL_ADVISOR]: [
    "Bagaimana cara mengelola cash flow bisnis yang seasonal?",
    "Investasi apa yang cocok untuk UKM dengan modal terbatas?",
    "Bagaimana cara menghitung break-even point bisnis saya?",
    "Strategi pendanaan apa yang terbaik untuk startup?",
    "Bagaimana cara optimasi pajak untuk bisnis kecil?"
  ],
  [AgentType.MARKET_ANALYST]: [
    "Apa tren pasar e-commerce Indonesia saat ini?",
    "Bagaimana behavior konsumen Gen Z terhadap produk sustainable?",
    "Analisis kompetitor untuk bisnis fintech Indonesia?",
    "Segmentasi pasar mana yang paling potensial untuk produk saya?",
    "Bagaimana cara riset pasar yang efektif dengan budget terbatas?"
  ],
  [AgentType.RISK_ASSESSOR]: [
    "Apa risiko utama dalam bisnis online dan cara mitigasinya?",
    "Bagaimana compliance GDPR untuk startup Indonesia?",
    "Risiko apa saja dalam ekspansi bisnis ke luar negeri?",
    "Bagaimana membuat business continuity plan yang efektif?",
    "Apa saja regulatory risk dalam industri fintech?"
  ],
  [AgentType.LEARNING_CURATOR]: [
    "Skill apa yang harus dipelajari untuk menjadi entrepreneur sukses?",
    "Bagaimana cara belajar digital marketing secara otodidak?",
    "Sertifikasi apa yang berguna untuk karir di bidang data science?",
    "Bagaimana membuat learning path untuk team development?",
    "Platform belajar online mana yang terbaik untuk bisnis skills?"
  ]
};

const aiAgentsModule = { agents, AgentRouter, exampleQuestions };
export default aiAgentsModule;
