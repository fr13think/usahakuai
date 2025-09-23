import axios from 'axios';

const NVIDIA_NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export interface NvidiaNimMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface NvidiaNimOptions {
  messages: NvidiaNimMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export async function generateWithNvidiaNim(options: NvidiaNimOptions): Promise<string> {
  if (!process.env.NVIDIA_NIM_API_KEY) {
    throw new Error('NVIDIA_NIM_API_KEY environment variable is required');
  }

  const headers = {
    "Authorization": `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  const payload = {
    model: options.model || 'meta/llama-4-scout-17b-16e-instruct',
    messages: options.messages,
    max_tokens: options.max_tokens || 1024,
    temperature: options.temperature || 0.8,
    top_p: options.top_p || 0.9,
    frequency_penalty: options.frequency_penalty || 0.0,
    presence_penalty: options.presence_penalty || 0.0,
    stream: false
  };

  try {
    const response = await axios.post(NVIDIA_NIM_URL, payload, { 
      headers, 
      timeout: 60000 // 60 second timeout
    });

    if (response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content;
      return content;
    } else {
      throw new Error('Invalid response from Nvidia NIM API');
    }
  } catch (error) {
    console.error('Nvidia NIM API error:', error);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      if (statusCode === 401) {
        throw new Error('Invalid Nvidia NIM API key');
      } else if (statusCode === 429) {
        throw new Error('Rate limit exceeded for Nvidia NIM API');
      } else if (statusCode === 500) {
        throw new Error('Nvidia NIM API server error');
      } else {
        throw new Error(`Nvidia NIM API error: ${errorMessage}`);
      }
    }
    
    throw new Error(`Nvidia NIM API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Available Nvidia NIM models with vision support
export const NVIDIA_NIM_MODELS = {
  LLAMA_4_SCOUT_17B: 'meta/llama-4-scout-17b-16e-instruct',
  // Alternative vision models to try
  LLAMA_3_2_VISION_11B: 'meta/llama-3.2-11b-vision-instruct',
  LLAMA_3_2_VISION_90B: 'meta/llama-3.2-90b-vision-instruct',
  // Add other vision-capable models here as they become available
} as const;
