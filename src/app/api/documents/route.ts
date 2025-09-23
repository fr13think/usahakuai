import { NextRequest, NextResponse } from 'next/server'
import { summarizeFinancialDocuments } from '@/ai/flows/summarize-financial-documents'
import { createDocumentAnalysis, getDocumentAnalyses } from '@/lib/supabase/document-analyses'
import { createServerClient } from '@/lib/supabase/server'
import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analyses = await getDocumentAnalyses(user.id)
    
    // Ensure we return plain objects
    const plainAnalyses = JSON.parse(JSON.stringify(analyses || []))
    
    return NextResponse.json(plainAnalyses)
  } catch (error) {
    console.error('Error fetching document analyses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document analyses' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, documentDataUri, text } = body

    if (action === 'analyze') {
      // Perform document analysis
      const analysisResult = await summarizeFinancialDocuments({ documentDataUri })
      
      // Ensure we return plain objects
      const plainResult = JSON.parse(JSON.stringify(analysisResult))
      
      return NextResponse.json(plainResult)
    } else if (action === 'analyze_text') {
      // Analyze extracted text directly
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text is required for analysis' }, { status: 400 })
      }
      
      const analysisResult = await analyzeTextWithGroq(text)
      
      // Ensure we return plain objects
      const plainResult = JSON.parse(JSON.stringify(analysisResult))
      
      return NextResponse.json(plainResult)
    } else if (action === 'save') {
      // Save analysis to database
      const { file_name, file_size, file_type, summary, key_points, recommendations } = body
      
      const savedAnalysis = await createDocumentAnalysis({
        user_id: user.id,
        file_name,
        file_size,
        file_type,
        summary,
        key_points,
        recommendations
      })
      
      // Ensure we return plain objects
      const plainAnalysis = JSON.parse(JSON.stringify(savedAnalysis))
      
      return NextResponse.json(plainAnalysis)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing document request:', error)
    return NextResponse.json(
      { error: 'Failed to process document request' }, 
      { status: 500 }
    )
  }
}

// Helper function to analyze extracted text with Groq AI
async function analyzeTextWithGroq(text: string) {
  try {
    const systemPrompt = `Anda adalah analis keuangan ahli yang mengkhususkan diri membantu pemilik UKM di Indonesia.

Tugas Anda adalah menganalisis teks dokumen yang diberikan dan memberikan insight yang berguna.

PENTING: Berikan respons HANYA dalam format JSON yang valid, tanpa teks tambahan atau penjelasan di luar JSON. Semua analisis dan rekomendasi harus dalam Bahasa Indonesia dan disesuaikan dengan konteks bisnis UKM Indonesia.`;

    const userPrompt = `Analisis teks dokumen berikut:

"${text.substring(0, 4000)}"${text.length > 4000 ? '\n\n[Teks dipotong untuk analisis...]' : ''}

Berdasarkan teks dokumen di atas, berikan analisis dalam format JSON dengan struktur berikut:
{
  "summary": "Ringkasan dokumen dalam Bahasa Indonesia",
  "keyPoints": ["Poin kunci 1", "Poin kunci 2", "Poin kunci 3", ...],
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3", ...]
}

Analisis harus mencakup:
1. Ringkasan umum isi dokumen
2. Poin-poin kunci yang paling penting dari dokumen
3. Rekomendasi yang dapat ditindaklanjuti berdasarkan isi dokumen

Semua respons harus dalam Bahasa Indonesia dan fokus pada konteks bisnis UKM Indonesia.`;

    const result = await generateWithGroq({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.7,
      max_tokens: 3000
    });

    // Extract JSON from markdown response if needed
    let jsonString = result.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON response
    const parsed = JSON.parse(jsonString);
    
    // Validate response structure
    return {
      summary: parsed.summary || 'Ringkasan tidak tersedia',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['Poin kunci tidak tersedia'],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Rekomendasi tidak tersedia']
    };
  } catch (error) {
    console.error('Error analyzing text with Groq:', error);
    
    // Return fallback response
    return {
      summary: 'Maaf, terjadi kesalahan saat menganalisis teks. AI berhasil membaca teks dari dokumen, namun gagal memberikan analisis mendalam.',
      keyPoints: [
        'Teks berhasil diekstrak dari dokumen',
        'Proses OCR telah selesai dengan baik',
        'Sistem AI mengalami kendala dalam analisis lanjutan'
      ],
      recommendations: [
        'Coba upload kembali dokumen dengan format yang lebih jelas',
        'Pastikan dokumen berisi informasi yang lengkap',
        'Hubungi tim dukungan jika masalah berlanjut'
      ]
    };
  }
}
