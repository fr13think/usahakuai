import {genkit} from 'genkit';

// Simplified Genkit configuration without Google AI plugin
export const ai = genkit({
  plugins: [],
  // We'll handle model calls directly with Groq
});
