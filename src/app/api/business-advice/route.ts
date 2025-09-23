import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { exaAPI } from '@/lib/exa-api';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface BusinessAdviceRequest {
  businessType: string;
  industry: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access this feature.' },
        { status: 401 }
      );
    }

    const body: BusinessAdviceRequest = await request.json();
    const { businessType, industry } = body;

    // Validate input
    if (!businessType?.trim() || !industry?.trim()) {
      return NextResponse.json(
        { error: 'Business type and industry are required.' },
        { status: 400 }
      );
    }

    // Get market intelligence from Exa API
    const marketIntelligence = await exaAPI.getMarketIntelligence(businessType, industry);

    // Prepare data for AI analysis
    const marketData = {
      marketTrends: marketIntelligence.marketTrends.map(trend => ({
        title: trend.title,
        summary: trend.summary,
        publishedDate: trend.publishedDate,
      })),
      competitorAnalysis: marketIntelligence.competitorAnalysis.map(competitor => ({
        title: competitor.title,
        summary: competitor.summary,
      })),
      industryNews: marketIntelligence.industryNews.map(news => ({
        title: news.title,
        summary: news.summary,
      })),
      regulations: marketIntelligence.regulations.map(regulation => ({
        title: regulation.title,
        summary: regulation.summary,
      })),
      opportunities: marketIntelligence.opportunities.map(opportunity => ({
        title: opportunity.title,
        summary: opportunity.summary,
      })),
    };

    // Generate AI recommendations using Groq
    
    let recommendations;
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not configured');
      }

      const aiPrompt = `Sebagai konsultan bisnis berpengalaman di Indonesia, analisis data pasar berikut untuk bisnis "${businessType}" di industri "${industry}":

MARKET INTELLIGENCE:
${JSON.stringify(marketData, null, 2)}

Berikan rekomendasi bisnis yang komprehensif dalam format JSON berikut:

{
  "summary": "Ringkasan eksekutif singkat tentang kondisi pasar dan outlook bisnis (2-3 paragraf)",
  "quickWins": [
    "Strategi yang dapat diimplementasikan dalam 1-3 bulan dengan effort minimal",
    "Fokus pada aksi konkret dan spesifik",
    "Maksimal 6 poin"
  ],
  "longTermStrategy": [
    "Strategi jangka panjang untuk pertumbuhan berkelanjutan",
    "Rencana strategis untuk 6-24 bulan ke depan", 
    "Maksimal 6 poin"
  ],
  "opportunities": [
    "Peluang pasar spesifik yang dapat dimanfaatkan",
    "Area ekspansi atau inovasi yang potensial",
    "Berdasarkan data tren dan analisis kompetitor",
    "Maksimal 6 poin"
  ],
  "riskFactors": [
    "Risiko dan tantangan yang perlu diantisipasi",
    "Faktor eksternal yang dapat mempengaruhi bisnis",
    "Sertakan strategi mitigasi jika memungkinkan",
    "Maksimal 6 poin"
  ]
}

GUIDELINES:
- Gunakan bahasa Indonesia yang profesional dan mudah dipahami
- Berikan rekomendasi yang praktis dan actionable
- Fokus pada konteks pasar Indonesia
- Pertimbangkan kondisi ekonomi dan regulasi terkini
- Setiap poin harus spesifik dan dapat diukur jika memungkinkan
- Hindari saran yang terlalu generic atau umum

Pastikan output dalam format JSON yang valid.`;

      const completion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        messages: [
          {
            role: "system",
            content: "You are an experienced business consultant specializing in the Indonesian market. Provide practical, actionable business advice based on real market data. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from Groq AI');
      }

      recommendations = JSON.parse(aiResponse);

    } catch (aiError) {
      console.error('Groq AI error:', aiError);
      
      // Check if we have sufficient market data to provide meaningful recommendations
      const totalMarketData = marketData.marketTrends.length + marketData.competitorAnalysis.length + 
                             marketData.industryNews.length + marketData.regulations.length + 
                             marketData.opportunities.length;
      
      if (totalMarketData === 0) {
        // No market data available - return error instead of generic recommendations
        return NextResponse.json(
          { 
            error: 'Tidak dapat menghasilkan saran bisnis yang akurat karena data pasar tidak tersedia untuk query ini.',
            details: 'Market intelligence tidak ditemukan. Silakan coba dengan jenis bisnis atau industri yang berbeda.'
          },
          { status: 422 }
        );
      }
      
      // Minimal fallback - only if we have some market data but AI failed
      recommendations = {
        summary: `Analisis untuk ${businessType} di industri ${industry} berhasil mengumpulkan ${totalMarketData} data point dari berbagai sumber. Namun, sistem AI saat ini tidak tersedia untuk memberikan rekomendasi detail.`,
        quickWins: [
          "Lakukan riset lebih mendalam berdasarkan data pasar yang ditemukan",
          "Analisis kompetitor berdasarkan informasi yang tersedia", 
          "Konsultasi dengan ahli industri untuk validasi strategi"
        ],
        longTermStrategy: [
          "Kembangkan strategi berdasarkan analisis data pasar yang telah dikumpulkan",
          "Monitoring trend industri secara berkala", 
          "Evaluasi ulang strategi setelah mendapat data lebih lengkap"
        ],
        opportunities: [
          "Evaluasi peluang berdasarkan data yang telah dikumpulkan"
        ],
        riskFactors: [
          "Keterbatasan data menyebabkan analisis risiko tidak lengkap - diperlukan riset tambahan"
        ]
      };
    }

    // Prepare final response
    const response = {
      marketIntelligence,
      recommendations,
      summary: recommendations.summary || `Analisis untuk ${businessType} di industri ${industry} telah selesai dengan berbagai insight dan rekomendasi strategis.`
    };


    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Business advice API error:', error);

    // Check if it's an Exa API specific error
    if (error instanceof Error && error.message.includes('Exa API')) {
      return NextResponse.json(
        { 
          error: 'Market intelligence service is currently unavailable. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 503 }
      );
    }


    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while generating business advice.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}