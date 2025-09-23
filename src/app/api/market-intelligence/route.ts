import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Free APIs for market data
// Note: API keys are accessed directly from process.env in functions that need them

interface NewsArticleType {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

async function fetchLatestNews(industry: string) {
  try {
    // Check if News API key is configured and not demo
    if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'demo' || process.env.NEWS_API_KEY === 'your_news_api_key_here') {
      console.warn('News API key not configured, using fallback data');
      return getMockNewsData(industry);
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(industry + ' Indonesia business')}&sortBy=publishedAt&language=id&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    );
    
    if (!response.ok) {
      console.warn(`News API failed with status ${response.status}, using fallback`);
      return getMockNewsData(industry);
    }
    
    const data = await response.json();
    return data.articles || getMockNewsData(industry);
  } catch (error) {
    console.error('News API error:', error);
    return getMockNewsData(industry);
  }
}

function getMockNewsData(industry: string) {
  return [
    {
      title: `Perkembangan Terbaru Industri ${industry} di Indonesia`,
      description: `Industri ${industry} menunjukkan pertumbuhan yang positif dengan dukungan digitalisasi dan regulasi yang mendukung UMKM.`,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Business Indonesia' },
      url: '#'
    },
    {
      title: `Peluang Investasi ${industry} Semakin Terbuka Lebar`,
      description: `Investor mulai melirik sektor ${industry} sebagai peluang investasi jangka panjang dengan potensi return menarik.`,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Kompas Ekonomi' },
      url: '#'
    },
    {
      title: `Transformasi Digital ${industry} di Era Modern`,
      description: `Digitalisasi membawa perubahan fundamental dalam cara beroperasi di industri ${industry}, membuka peluang inovasi baru.`,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Tech in Asia Indonesia' },
      url: '#'
    },
    {
      title: `Regulasi Baru Dukung Pertumbuhan ${industry}`,
      description: `Pemerintah meluncurkan kebijakan baru yang diharapkan dapat mendorong pertumbuhan sektor ${industry} lebih pesat.`,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Bisnis Indonesia' },
      url: '#'
    },
    {
      title: `Tantangan dan Peluang ${industry} Pasca Pandemi`,
      description: `Analisis mendalam tentang bagaimana industri ${industry} beradaptasi dan menemukan peluang baru di era new normal.`,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      source: { name: 'CNN Indonesia' },
      url: '#'
    }
  ];
}

function getMockEconomicData() {
  return {
    forex: {
      'Realtime Currency Exchange Rate': {
        '5. Exchange Rate': '15750.50',
        '9. Change': '-25.30'
      }
    },
    stock: {
      'Global Quote': {
        '05. price': '7245.80',
        '09. change': '42.15',
        '10. change percent': '0.58%'
      }
    }
  };
}

async function fetchEconomicData() {
  try {
    // Check if Alpha Vantage API key is configured
    if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY === 'demo' || process.env.ALPHA_VANTAGE_API_KEY === 'your_alpha_vantage_key') {
      console.warn('Alpha Vantage API key not configured, using mock data');
      return getMockEconomicData();
    }

    // Get USD/IDR exchange rate
    const forexResponse = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=IDR&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!forexResponse.ok) {
      console.warn('Alpha Vantage API failed, using mock data');
      return getMockEconomicData();
    }
    
    const forexData = await forexResponse.json();
    
    // Get Indonesian stock market data (if available)
    const stockResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=EIDO&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    
    const stockData = stockResponse.ok ? await stockResponse.json() : null;
    
    return {
      forex: forexData,
      stock: stockData || getMockEconomicData().stock
    };
  } catch (error) {
    console.error('Economic data API error:', error);
    return getMockEconomicData();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if GROQ API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { industry } = await request.json();

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch real market data
    const [newsArticles, economicData] = await Promise.all([
      fetchLatestNews(industry),
      fetchEconomicData()
    ]);

    // Step 2: Process news with Llama Groq for insights
    const newsContext = newsArticles.slice(0, 5).map((article: NewsArticleType) => 
      `${article.title}: ${article.description}`
    ).join('\\n');

    const marketAnalysisPrompt = `
Analisis kondisi pasar industri ${industry} berdasarkan data terkini:

NEWS CONTEXT:
${newsContext}

ECONOMIC INDICATORS:
${economicData ? JSON.stringify(economicData, null, 2) : 'Economic data unavailable'}

RESPOND WITH ONLY THE JSON OBJECT BELOW, NO OTHER TEXT:
{
  "insights": [
    {
      "id": "unique-id",
      "title": "insight title",
      "summary": "detailed analysis",
      "impact": "high|medium|low",
      "sentiment": "positive|negative|neutral",
      "source": "data source",
      "timestamp": "2024-01-01T00:00:00Z",
      "actionable": ["action1", "action2", "action3"]
    }
  ],
  "metrics": {
    "usdIdr": {
      "rate": 15700,
      "change": -0.5,
      "trend": "down"
    },
    "stockIndex": {
      "value": 7200,
      "change": 1.2,
      "trend": "up"
    },
    "inflation": {
      "rate": 2.8,
      "change": 0.1
    },
    "interests": {
      "rate": 6.0,
      "change": 0.0
    }
  },
  "competitors": [
    {
      "company": "Competitor Name",
      "news": "latest development",
      "impact": "impact on market",
      "opportunity": "opportunities for your business",
      "threat": "potential threats"
    }
  ]
}

Fokus pada:
1. Trend yang mempengaruhi industri ${industry}
2. Actionable insights untuk UKM
3. Competitive intelligence
4. Economic indicators impact
5. Opportunities dan threats`;

    const analysisCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Anda adalah market analyst senior dengan pengalaman 10+ tahun analyzing Indonesian markets. Berikan analisis yang data-driven dan actionable untuk UKM. IMPORTANT: Respond with ONLY valid JSON, no additional text, explanations, or markdown formatting."
        },
        {
          role: "user",
          content: marketAnalysisPrompt
        }
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const analysisText = analysisCompletion.choices[0]?.message?.content || '';
    
    // Parse JSON response
    let marketAnalysis;
    try {
      let jsonString = '';
      
      // Try to extract JSON from markdown code blocks first
      const codeBlockMatch = analysisText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1].trim();
      } else {
        // Fallback to finding JSON object directly
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          jsonString = jsonMatch[0];
        }
      }
      
      if (jsonString) {
        marketAnalysis = JSON.parse(jsonString);
      } else {
        console.error('LLM response did not contain a recognizable JSON object. Raw response:', analysisText);
        throw new Error('Invalid LLM response format: No JSON object found.');
      }
    } catch (e) {
      console.error('Failed to parse market analysis JSON:', e);
      
      // If JSON parsing fails, try to extract from the first complete JSON object in the response
      try {
        const fallbackMatch = analysisText.match(/\{(?:[^{}]|{[^}]*})*\}/);
        if (fallbackMatch) {
          marketAnalysis = JSON.parse(fallbackMatch[0]);
        } else {
          return NextResponse.json(
            { error: 'Failed to generate market analysis - invalid JSON format' },
            { status: 500 }
          );
        }
      } catch (fallbackError) {
        console.error('Fallback JSON parsing also failed:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to generate market analysis - JSON parsing error' },
          { status: 500 }
        );
      }
    }

    // Step 3: Enhance with real data if available
    if (economicData?.forex?.['Realtime Currency Exchange Rate']) {
      const exchangeRate = economicData.forex['Realtime Currency Exchange Rate'];
      marketAnalysis.metrics.usdIdr = {
        rate: parseFloat(exchangeRate['5. Exchange Rate']),
        change: parseFloat(exchangeRate['9. Change']),
        trend: parseFloat(exchangeRate['9. Change']) >= 0 ? 'up' : 'down'
      };
    }

    if (economicData?.stock?.['Global Quote']) {
      const quote = economicData.stock['Global Quote'];
      marketAnalysis.metrics.stockIndex = {
        value: parseFloat(quote['05. price']),
        change: parseFloat(quote['10. change percent'].replace('%', '')),
        trend: parseFloat(quote['09. change']) >= 0 ? 'up' : 'down'
      };
    }

    // Step 4: Generate additional competitor intelligence
    if (newsArticles.length > 5) {
      const competitorPrompt = `
Berdasarkan berita terkini tentang industri ${industry}, identifikasi kompetitor utama dan analisis dampaknya:

NEWS: ${newsArticles.slice(5, 10).map((a: NewsArticleType) => a.title).join('; ')}

RESPOND WITH ONLY THE JSON ARRAY BELOW, NO OTHER TEXT:
[
  {
    "company": "Nama Perusahaan",
    "news": "Perkembangan terbaru",
    "impact": "Dampak terhadap industri", 
    "opportunity": "Peluang yang bisa dimanfaatkan",
    "threat": "Ancaman yang perlu diwaspadai"
  }
]`

      const competitorCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system", 
            content: "Anda adalah competitive intelligence specialist. Berikan analisis kompetitor yang objective dan actionable. IMPORTANT: Respond with ONLY valid JSON array, no additional text, explanations, or markdown formatting."
          },
          {
            role: "user",
            content: competitorPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      try {
        const competitorText = competitorCompletion.choices[0]?.message?.content || '';
        let competitorJsonString = '';
        
        // Try to extract JSON from markdown code blocks first
        const codeBlockMatch = competitorText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          competitorJsonString = codeBlockMatch[1].trim();
        } else {
          // Fallback to finding JSON array directly
          const arrayMatch = competitorText.match(/\[[\s\S]*\]/);
          if (arrayMatch && arrayMatch[0]) {
            competitorJsonString = arrayMatch[0];
          }
        }
        
        if (competitorJsonString) {
          const competitorData = JSON.parse(competitorJsonString);
          if (Array.isArray(competitorData) && competitorData.length > 0) {
            marketAnalysis.competitors = competitorData;
          }
        }
      } catch (e) {
        console.warn('Failed to parse competitor analysis:', e);
      }
    }

    return NextResponse.json({
      ...marketAnalysis,
      generatedAt: new Date().toISOString(),
      industry,
      dataFreshness: {
        news: newsArticles.length > 0 ? 'fresh' : 'limited',
        economic: economicData ? 'available' : 'unavailable',
        analysis: 'ai-generated'
      }
    });

  } catch (error) {
    console.error('Market intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to generate market intelligence' },
      { status: 500 }
    );
  }
}