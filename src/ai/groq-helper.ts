import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface GroqGenerateOptions {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateWithGroq(options: GroqGenerateOptions): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required');
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: options.messages,
      model: options.model || 'llama-3.3-70b-versatile', // Default to available model
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Groq API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Available Llama models on Groq (updated December 2024)
export const GROQ_MODELS = {
  // Main Llama models - currently available
  LLAMA_3_3_70B_VERSATILE: 'llama-3.3-70b-versatile',
  LLAMA_3_1_8B_INSTANT: 'llama-3.1-8b-instant',
  
  // Llama 4 models (Meta)
  LLAMA_4_MAVERICK_17B: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  LLAMA_4_SCOUT_17B: 'meta-llama/llama-4-scout-17b-16e-instruct',
} as const;
