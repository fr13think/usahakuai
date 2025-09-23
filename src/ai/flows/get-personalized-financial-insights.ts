'use server';
/**
 * @fileOverview Flow for generating personalized financial insights for SME owners.
 *
 * - getPersonalizedFinancialInsights - A function that generates financial insights based on user input.
 * - FinancialInsightsInput - The input type for the getPersonalizedFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the getPersonalizedFinancialInsights function.
 */

import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper';
import {z} from 'zod';

export type FinancialInsightsInput = {
  revenue: number;
  expenses: number;
  assets: number;
  liabilities: number;
  marketTrends: string;
  businessGoals: string;
};

const FinancialInsightsOutputSchema = z.object({
  cashFlowAnalysis: z.string().describe('An analysis of the SME’s cash flow.'),
  profitabilityAnalysis: z.string().describe('An analysis of the SME’s profitability.'),
  investmentOpportunities: z.string().describe('Potential investment opportunities for the SME.'),
  recommendations: z.string().describe('Recommendations tailored to the SME owner’s goals.'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function getPersonalizedFinancialInsights(
  input: FinancialInsightsInput
): Promise<FinancialInsightsOutput> {
  const systemPrompt = `Anda adalah penasihat keuangan ahli yang mengkhususkan diri memberikan wawasan kepada UKM Indonesia.

Tugas Anda adalah menganalisis data keuangan yang diberikan dan memberikan wawasan serta rekomendasi keuangan yang dipersonalisasi untuk pemilik UKM.

PENTING: Berikan respons HANYA dalam format JSON yang valid, tanpa teks tambahan atau penjelasan di luar JSON. Semua analisis dan rekomendasi harus dalam Bahasa Indonesia dan disesuaikan dengan konteks bisnis UKM Indonesia.

Fokuskan pada praktik keuangan yang realistis dan dapat diterapkan untuk UKM di Indonesia, termasuk pertimbangan regulasi dan kondisi pasar lokal.`;

  const userPrompt = `Data Keuangan UKM:
- Pendapatan: Rp ${input.revenue.toLocaleString('id-ID')}
- Pengeluaran: Rp ${input.expenses.toLocaleString('id-ID')}
- Aset: Rp ${input.assets.toLocaleString('id-ID')}
- Kewajiban: Rp ${input.liabilities.toLocaleString('id-ID')}
- Tren Pasar: ${input.marketTrends}
- Tujuan Bisnis: ${input.businessGoals}

Berdasarkan data keuangan di atas, berikan analisis dan rekomendasi yang mencakup:

1. Analisis Arus Kas - Analisis arus kas UKM dan identifikasi area yang perlu diperbaiki
2. Analisis Profitabilitas - Penilaian profitabilitas UKM dan strategi untuk meningkatkannya
3. Peluang Investasi - Identifikasi peluang investasi yang selaras dengan tujuan pemilik UKM
4. Rekomendasi - Rekomendasi yang dipersonalisasi sesuai situasi dan tujuan pemilik UKM

Berikan respons dalam format JSON yang valid dengan struktur berikut:
{
  "cashFlowAnalysis": "Analisis arus kas yang detail dalam Bahasa Indonesia",
  "profitabilityAnalysis": "Analisis profitabilitas yang detail dalam Bahasa Indonesia", 
  "investmentOpportunities": "Peluang investasi yang detail dalam Bahasa Indonesia",
  "recommendations": "Rekomendasi yang detail dalam Bahasa Indonesia"
}

Hanya berikan JSON, tanpa teks lain di luar format JSON. Pastikan semua analisis dalam Bahasa Indonesia dan disesuaikan untuk UKM Indonesia.`;

  try {
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
    const parsed = JSON.parse(jsonString) as FinancialInsightsOutput;
    
    // Validate the response against our schema and return plain object
    const validated = FinancialInsightsOutputSchema.parse(parsed);
    return JSON.parse(JSON.stringify(validated));
  } catch (error) {
    console.error('Error generating financial insights:', error);
    throw new Error('Failed to generate financial insights with Groq/Llama');
  }
}
