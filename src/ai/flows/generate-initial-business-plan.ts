'use server';

/**
 * @fileOverview Generates an initial business plan draft for new SME owners in Indonesia.
 *
 * - generateInitialBusinessPlan - A function that generates the business plan.
 * - GenerateInitialBusinessPlanInput - The input type for the generateInitialBusinessPlan function.
 * - GenerateInitialBusinessPlanOutput - The return type for the generateInitialBusinessPlan function.
 */

import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper';
import {z} from 'zod';

export type GenerateInitialBusinessPlanInput = {
  prompt: string;
};

const GenerateInitialBusinessPlanOutputSchema = z.object({
  executiveSummary: z.string().describe('The Executive Summary of the business plan.'),
  companyDescription: z.string().describe('The Company Description section of the business plan.'),
  productsAndServices: z.string().describe('The Products and Services section of the business plan.'),
  marketAnalysis: z.string().describe('The Market Analysis section of the business plan.'),
  marketingAndSalesStrategy: z.string().describe('The Marketing and Sales Strategy section of the business plan.'),
  managementTeam: z.string().describe('The Management Team section of the business plan.'),
  financialPlan: z.string().describe('The Financial Plan section of the business plan.'),
  appendix: z.string().describe('The Appendix section of the business plan.'),
});
export type GenerateInitialBusinessPlanOutput = z.infer<typeof GenerateInitialBusinessPlanOutputSchema>;

export async function generateInitialBusinessPlan(input: GenerateInitialBusinessPlanInput): Promise<GenerateInitialBusinessPlanOutput> {
  const systemPrompt = `Anda adalah konsultan bisnis ahli yang mengkhususkan diri membantu pemilik UKM baru di Indonesia.

Tugas Anda adalah menghasilkan rencana bisnis awal yang terperinci berdasarkan deskripsi ide bisnis yang diberikan.

PENTING: Berikan respons HANYA dalam format JSON yang valid, tanpa teks tambahan atau penjelasan di luar JSON. Setiap bagian harus berisi konten yang informatif dan praktis dalam format markdown.

Fokuskan pada konteks bisnis Indonesia, termasuk regulasi, pasar, dan praktik bisnis lokal yang relevan.`;

  const userPrompt = `Deskripsi ide bisnis: ${input.prompt}

Generate a detailed business plan draft. For each section, provide a detailed response in markdown format:

1. Executive Summary - Ringkasan eksekutif yang menarik
2. Company Description - Deskripsi perusahaan yang jelas
3. Products and Services - Produk dan layanan yang ditawarkan
4. Market Analysis - Analisis pasar yang mendalam
5. Marketing and Sales Strategy - Strategi pemasaran dan penjualan
6. Management Team - Tim manajemen
7. Financial Plan - Rencana keuangan
8. Appendix - Lampiran

Berikan respons dalam format JSON yang valid dengan struktur berikut:
{
  "executiveSummary": "Ringkasan eksekutif yang menarik dalam format markdown",
  "companyDescription": "Deskripsi perusahaan yang jelas dalam format markdown",
  "productsAndServices": "Produk dan layanan yang ditawarkan dalam format markdown",
  "marketAnalysis": "Analisis pasar yang mendalam dalam format markdown",
  "marketingAndSalesStrategy": "Strategi pemasaran dan penjualan dalam format markdown",
  "managementTeam": "Tim manajemen dalam format markdown",
  "financialPlan": "Rencana keuangan dalam format markdown",
  "appendix": "Lampiran dalam format markdown"
}

Hanya berikan JSON, tanpa teks lain di luar format JSON.`;

  try {
    const result = await generateWithGroq({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.7,
      max_tokens: 4000
    });

    // Extract JSON from markdown response if needed
    let jsonString = result.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON response
    const parsed = JSON.parse(jsonString) as GenerateInitialBusinessPlanOutput;
    
    // Validate the response against our schema and return plain object
    const validated = GenerateInitialBusinessPlanOutputSchema.parse(parsed);
    return JSON.parse(JSON.stringify(validated));
  } catch (error) {
    console.error('Error generating business plan:', error);
    throw new Error('Failed to generate business plan with Groq/Llama');
  }
}
