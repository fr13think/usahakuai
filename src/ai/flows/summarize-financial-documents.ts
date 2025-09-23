// Summarizes financial documents for quick understanding of key information.

'use server';

import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper';
import { extractTextFromDataUri, cleanExtractedText } from '@/lib/text-extraction';
import { z } from 'zod';

export type SummarizeFinancialDocumentsInput = {
  documentDataUri: string;
};

const SummarizeFinancialDocumentsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the financial document.'),
  keyPoints: z.array(z.string()).describe('A list of the most important key points from the document.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations based on the document.'),
});
export type SummarizeFinancialDocumentsOutput =
  z.infer<typeof SummarizeFinancialDocumentsOutputSchema>;

export async function summarizeFinancialDocuments(
  input: SummarizeFinancialDocumentsInput
): Promise<SummarizeFinancialDocumentsOutput> {
  try {
    // Extract text from the uploaded document
    console.log('Extracting text from document...');
    const extractedText = await extractTextFromDataUri(input.documentDataUri);
    const cleanText = cleanExtractedText(extractedText.text);
    
    if (!cleanText || cleanText.length < 50) {
      throw new Error('Tidak dapat mengekstrak teks yang cukup dari dokumen. Pastikan dokumen berisi teks yang dapat dibaca.');
    }

    console.log(`Extracted ${cleanText.length} characters from document`);
    
    const prompt = `Anda adalah analis keuangan ahli. Analisis dokumen keuangan berikut dan berikan ringkasan dalam format JSON.

Isi Dokumen:
"""${cleanText.substring(0, 4000)}"""${cleanText.length > 4000 ? '\n\n[Dokumen dipotong untuk analisis...]' : ''}

Berdasarkan isi dokumen di atas, berikan analisis dalam format JSON dengan struktur berikut:
{
  "summary": "Ringkasan dokumen dalam Bahasa Indonesia",
  "keyPoints": ["Poin kunci 1", "Poin kunci 2", "Poin kunci 3", ...],
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3", ...]
}

Analisis harus mencakup:
1. Ringkasan umum isi dokumen
2. Poin-poin kunci yang paling penting dari dokumen
3. Rekomendasi yang dapat ditindaklanjuti berdasarkan isi dokumen

Jika dokumen bukan dokumen keuangan, tetap berikan analisis berdasarkan isi yang ada.
Semua respons harus dalam Bahasa Indonesia.`;

    const response = await generateWithGroq({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial analyst assistant. Always respond in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.7,
      max_tokens: 2000
    });

    // Parse the JSON response
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    const jsonResponse = response.slice(jsonStart, jsonEnd);
    
    const parsedResponse = JSON.parse(jsonResponse);
    
    // Validate the response structure
    const validatedResponse = SummarizeFinancialDocumentsOutputSchema.parse({
      summary: parsedResponse.summary || 'Ringkasan tidak tersedia',
      keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : ['Poin kunci tidak tersedia'],
      recommendations: Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : ['Rekomendasi tidak tersedia']
    });
    
    // Ensure we return a plain object for client component compatibility
    return {
      summary: validatedResponse.summary,
      keyPoints: [...validatedResponse.keyPoints],
      recommendations: [...validatedResponse.recommendations]
    };
  } catch (error) {
    console.error('Error in summarizeFinancialDocuments:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return a fallback response as plain object
    return JSON.parse(JSON.stringify({
      summary: `Maaf, terjadi kesalahan saat menganalisis dokumen: ${errorMessage}`,
      keyPoints: [
        'Tidak dapat memproses dokumen saat ini',
        'Untuk PDF: Pastikan dokumen berisi teks (bukan hanya gambar)',
        'Untuk gambar: Pastikan teks di gambar jelas dan dapat dibaca',
        'Format yang didukung: PDF dengan teks, JPG, PNG'
      ],
      recommendations: [
        'Coba scan ulang dokumen dengan kualitas yang lebih baik',
        'Pastikan teks di dokumen jelas dan tidak terlalu kecil',
        'Jika PDF, pastikan bukan hasil scan yang berkualitas rendah',
        'Hubungi tim dukungan jika masalah berlanjut'
      ]
    }));
  }
}
