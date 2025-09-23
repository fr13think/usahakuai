'use server';

/**
 * @fileOverview Generates sales content (title, description, hashtags) from product images using Groq Llama Vision.
 *
 * - generateSalesContent - A function that analyzes product images and generates sales content.
 * - GenerateSalesContentInput - The input type for the generateSalesContent function.
 * - GenerateSalesContentOutput - The return type for the generateSalesContent function.
 */

import { generateWithNvidiaNim, NVIDIA_NIM_MODELS } from '@/ai/nvidia-nim-helper';
import { z } from 'zod';

const GenerateSalesContentInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe("A product image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateSalesContentInput = z.infer<typeof GenerateSalesContentInputSchema>;

const GenerateSalesContentOutputSchema = z.object({
  title: z.string().describe('A catchy and engaging product title/caption for social media or marketplace.'),
  description: z.string().describe('A detailed and persuasive product description optimized for sales.'),
  hashtags: z.array(z.string()).describe('A list of relevant hashtags for social media marketing.'),
});
export type GenerateSalesContentOutput = z.infer<typeof GenerateSalesContentOutputSchema>;

export async function generateSalesContent(
  input: GenerateSalesContentInput
): Promise<GenerateSalesContentOutput> {
  try {
    // Validate input
    const validatedInput = GenerateSalesContentInputSchema.parse(input);
    
    // Extract base64 image data from dataUri
    const base64Data = validatedInput.imageDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data URI format');
    }

    // Determine image format from dataUri
    const mimeMatch = validatedInput.imageDataUri.match(/data:image\/([^;]+)/);
    const imageFormat = mimeMatch ? mimeMatch[1] : 'png';
    
    // Validate image size and quality
    const imageSizeKB = Math.round((base64Data.length * 0.75) / 1024); // Approximate size in KB
    
    if (imageSizeKB > 8000) { // > 8MB - Log warning for very large images
      console.warn('Large image detected. Size:', imageSizeKB, 'KB');
    }
    

    // Unused userPrompt - keeping for reference
    /*
    const userPrompt = `Analisis gambar produk ini dengan TELITI dan buatkan konten penjualan yang SPESIFIK berdasarkan apa yang benar-benar terlihat di gambar:

[IMAGE: data:image/${imageFormat};base64,${base64Data}]

Generate konten marketing berdasarkan analisis visual yang detail:

1. **imageCaption**: Judul/caption yang catchy dan engaging (maksimal 80 karakter). HARUS berdasarkan produk SPESIFIK yang terlihat di gambar (warna, bentuk, jenis, dll). Gunakan Bahasa Indonesia yang natural.

2. **salesCopy**: Deskripsi produk yang persuasif dalam Bahasa Indonesia (200-300 kata). HARUS mencakup detail visual spesifik yang terlihat di gambar (warna, ukuran, bentuk, gaya, kondisi, dll). Mulai dengan deskripsi visual yang menarik, jelaskan fitur berdasarkan yang terlihat, dan akhiri dengan call-to-action.

3. **hashtags**: 8-10 hashtag relevan yang dimulai dengan '#'. HARUS sesuai dengan jenis produk SPESIFIK yang terlihat di gambar dan target market Indonesia.

Response dalam format JSON:
{
  "imageCaption": "Caption spesifik berdasarkan produk yang benar-benar terlihat",
  "salesCopy": "Deskripsi detail dengan menyebutkan warna, bentuk, dan fitur visual yang terlihat",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"]
}

KRITIS: Jangan gunakan template generic! Analisis gambar dengan detail dan buat konten yang mencerminkan produk SPESIFIK yang terlihat. Sebutkan detail visual konkret (warna, bentuk, ukuran, gaya, kondisi) dalam deskripsi Anda.`;
    */

    // STEP 1: First, let's get accurate object identification
    let objectAnalysis: string;
    
    try {
      objectAnalysis = await generateWithNvidiaNim({
        messages: [
          { 
            role: 'system', 
            content: `You are a world-class computer vision specialist with expertise in precise object identification and Indonesian product terminology.

🔍 YOUR MISSION: Provide surgical precision in visual analysis with ZERO hallucination.

⚡ IDENTIFICATION PROTOCOL:
1. SCAN METHODOLOGY: Examine image systematically - center, foreground, background, edges
2. OBJECT HIERARCHY: Identify PRIMARY subject first, then secondary elements
3. FEATURE EXTRACTION: Note specific attributes - brand names, models, conditions, variations
4. CONTEXT ANALYSIS: Determine usage scenario, target demographic, market positioning
5. TERMINOLOGY: Use precise Indonesian terms for local products and concepts

🎯 CRITICAL ACCURACY RULES:
- NEVER guess or assume - only describe definitive observations
- Distinguish similar items precisely (smartphone vs tablet, sepatu vs sandal)
- Use Indonesian terminology: "sawah" not "field", "boneka" not "doll", "keripik" not "chips"
- Identify specific product categories: electronics model numbers, food brands, clothing styles
- Note any visible text, logos, branding, or distinctive features
- Describe condition accurately: new/used/damaged/packaging present

🧠 PRODUCT INTELLIGENCE:
- Electronics: Note brand, model, color, condition, accessories visible
- Food/Beverage: Identify specific type, packaging, brand if visible
- Fashion: Describe style, material, color, target demographic
- Nature/Scenery: Use specific Indonesian geographic/cultural terms
- Vehicles: Make, model, type, condition if identifiable

❌ AVOID THESE ERRORS:
- Generic descriptions ("makanan" instead of "nasi goreng", "elektronik" instead of "smartphone Samsung")
- Confusing similar objects (rice field vs grass field, toy vs real animal)
- Assuming features not clearly visible
- Western terminology when Indonesian equivalent exists`
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: '🔍 ANALISIS KOMPREHENSIF - Identifikasi gambar ini dengan akurasi tinggi:\n\n📋 LAPORAN YANG DIPERLUKAN:\n\n1. 🎯 OBJEK UTAMA: [Nama spesifik produk/objek dengan detail yang terlihat]\n2. 🎨 ANALISIS VISUAL: [Warna dominan, warna sekunder, pola/motif jika ada]\n3. 🔧 MATERIAL/TEKSTUR: [Bahan yang terlihat - plastik/metal/kain/kayu/dll]\n4. 📍 SETTING/KONTEKS: [Lokasi pengambilan - studio/indoor/outdoor/toko/alam/dll]\n5. 📂 KATEGORI PRODUK: [Jenis spesifik - teknologi/fashion/makanan/rumah tangga/dll]\n6. 🏷️ IDENTIFIKASI BRAND/MODEL: [Merek atau model jika terlihat jelas]\n7. 💎 KONDISI & KUALITAS: [Baru/bekas/berkualitas/rusak/dalam kemasan/dll]\n8. 👥 TARGET MARKET: [Siapa yang mungkin menggunakan produk ini]\n9. ✨ FITUR MENONJOL: [Ciri khas yang membedakan dari produk sejenis]\n10. 📝 DETAIL TAMBAHAN: [Informasi visual penting lainnya]\n\n⚠️ PENTING: Jawab HANYA berdasarkan apa yang benar-benar terlihat. Jika tidak yakin tentang detail tertentu, tulis "Tidak dapat dipastikan dari gambar".'
              },
              {
                type: 'image_url',
                image_url: {
                  url: 'data:image/' + imageFormat + ';base64,' + base64Data
                }
              }
            ]
          }
        ],
        model: NVIDIA_NIM_MODELS.LLAMA_3_2_VISION_11B,
        temperature: 0.3, // Lower temperature for more accurate identification
        max_tokens: 512
      });
      
    } catch (error) {
      console.error('Object identification failed:', error instanceof Error ? error.message : 'Unknown error');
      objectAnalysis = "Analisis objek tidak berhasil, menggunakan pendekatan langsung.";
    }
    
    // STEP 2: Now create marketing content based on the accurate identification
    let result: string;
    
    try {
      // Step 2: Create marketing content based on object analysis - SIMPLIFIED APPROACH
      const simplePrompt = `ANALISIS OBJEK: ${objectAnalysis}

Buat konten marketing Indonesia berdasarkan analisis di atas:

1. imageCaption: Judul menarik (max 80 karakter) dengan detail spesifik
2. salesCopy: Deskripsi persuasif 200-300 kata dengan detail visual
3. hashtags: 8 hashtag relevan

FORMAT JSON WAJIB:
{
  "imageCaption": "judul spesifik",
  "salesCopy": "deskripsi detail",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"]
}

HANYA BERIKAN JSON, TIDAK ADA TEKS LAIN!`;

      result = await generateWithNvidiaNim({
        messages: [
          { 
            role: 'system', 
            content: 'You are an Indonesian marketing copywriter. Create accurate product marketing content based on visual analysis. Always respond in valid JSON format only.'
          },
          { 
            role: 'user', 
            content: simplePrompt
          }
        ],
        model: NVIDIA_NIM_MODELS.LLAMA_4_SCOUT_17B, // Start with simpler model
        temperature: 0.5, // Lower temperature for more consistent JSON output
        max_tokens: 800
      });
      
    } catch (primaryError) {
      console.error('Content generation failed, trying fallback:', primaryError instanceof Error ? primaryError.message : 'Unknown error');
      try {
        // Fallback 1: Even simpler prompt with text-only model
        const basicPrompt = `Berdasarkan analisis: "${objectAnalysis.substring(0, 500)}"

Buat konten penjualan dalam JSON format:
{
  "imageCaption": "[judul 80 karakter]",
  "salesCopy": "[deskripsi 200 kata]",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
}

JSON saja, tidak ada text lain!`;

        result = await generateWithNvidiaNim({
          messages: [
            { role: 'system', content: 'You are a JSON response generator for Indonesian marketing content. Only return valid JSON.' },
            { role: 'user', content: basicPrompt }
          ],
          model: NVIDIA_NIM_MODELS.LLAMA_4_SCOUT_17B,
          temperature: 0.3, // Very low temperature for consistent format
          max_tokens: 600
        });
        
      } catch (fallback1Error) {
        console.error('Fallback 1 failed, trying fallback 2:', fallback1Error instanceof Error ? fallback1Error.message : 'Unknown error');
        try {
          // Fallback 2: Minimal vision model request
          result = await generateWithNvidiaNim({
            messages: [
              { role: 'system', content: 'Create Indonesian product marketing JSON. Format: {"imageCaption":"...","salesCopy":"...","hashtags":[...]}' },
              { 
                role: 'user', 
                content: [
                  {
                    type: 'text',
                    text: 'Create marketing content in JSON format for this product image. Use Indonesian language.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: 'data:image/' + imageFormat + ';base64,' + base64Data
                    }
                  }
                ]
              }
            ],
            model: NVIDIA_NIM_MODELS.LLAMA_3_2_VISION_11B, // Use smaller, more reliable model
            temperature: 0.3,
            max_tokens: 500
          });
          
        } catch {
          // Use the analysis from Step 1 to create a basic response
          const analysisWords = objectAnalysis.split(' ');
          const productKeywords = analysisWords.filter(word => 
            word.length > 3 && 
            !['yang', 'dan', 'atau', 'dengan', 'untuk', 'adalah', 'pada', 'dari', 'ini', 'itu'].includes(word.toLowerCase())
          ).slice(0, 5);
          
          result = JSON.stringify({
            imageCaption: `Produk ${productKeywords.slice(0, 2).join(' ')} - Siap Order!`,
            salesCopy: `Berdasarkan analisis: ${objectAnalysis.substring(0, 200)}... Produk berkualitas dengan spesifikasi menarik. Cocok untuk kebutuhan Anda dengan harga terjangkau. Hubungi kami untuk info lebih lanjut!`,
            hashtags: ['#ProdukBerkualitas', '#JualOnline', '#PromoMenarik', '#IndonesiaShop', '#OrderSekarang', '#KualitasTerbaik', '#TerpercayaShop', '#ProdukAsli']
          });
        }
      }
    }

    // Process AI response
    
    // Extract and parse JSON from various response formats
    let parsed: { imageCaption: string; salesCopy: string; hashtags: string[] } | null = null;
    const jsonString = result.trim();
    
    // Try multiple approaches to extract valid JSON
    const extractionMethods = [
      // Method 0: Direct JSON (if response is clean JSON)
      () => {
        try {
          // Try parsing the response directly as JSON
          const directParsed = JSON.parse(jsonString);
          if (directParsed && typeof directParsed === 'object' && 
              (directParsed.imageCaption || directParsed.title) &&
              (directParsed.salesCopy || directParsed.description)) {
            return jsonString;
          }
        } catch {
          // Not direct JSON, continue to other methods
        }
        return null;
      },
      
      // Method 1: Look for JSON in markdown code blocks
      () => {
        if (jsonString.includes('```json')) {
          const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            return jsonMatch[1].trim();
          }
        }
        if (jsonString.includes('```')) {
          const codeMatch = jsonString.match(/```[^\n]*\s*([\s\S]*?)\s*```/);
          if (codeMatch && codeMatch[1]) {
            return codeMatch[1].trim();
          }
        }
        return null;
      },
      
      // Method 2: Extract JSON object directly
      () => {
        const objectMatches = jsonString.match(/\{[\s\S]*?\}/g);
        if (objectMatches && objectMatches.length > 0) {
          // Try the longest match first (likely to be the complete JSON)
          const sortedMatches = objectMatches.sort((a, b) => b.length - a.length);
          return sortedMatches[0];
        }
        return null;
      },
      
      // Method 3: Handle markdown format responses
      () => {
        if (jsonString.includes('**imageCaption**') || jsonString.includes('**salesCopy**')) {
          const imageCaptionMatch = jsonString.match(/\*\*imageCaption\*\*:?\s*["']([^"']+)["']/) || 
                                   jsonString.match(/imageCaption["']*\s*:?\s*["']([^"']+)["']/);
          const salesCopyMatch = jsonString.match(/\*\*salesCopy\*\*:?\s*["']([^"']+)["']/) || 
                                jsonString.match(/salesCopy["']*\s*:?\s*["']([^"']+)["']/);
          const hashtagsMatch = jsonString.match(/\*\*hashtags\*\*:?\s*\[([^\]]+)\]/) || 
                               jsonString.match(/hashtags["']*\s*:?\s*\[([^\]]+)\]/);
          
          if (imageCaptionMatch || salesCopyMatch) {
            let hashtags = ['#ProdukBerkualitas', '#JualOnline', '#PromoMenarik', '#KualitasTerbaik'];
            
            if (hashtagsMatch) {
              hashtags = hashtagsMatch[1]
                .split(',')
                .map(tag => tag.trim().replace(/["/]/g, '').replace(/^#?/, '#'))
                .filter(tag => tag.length > 1);
            }
            
            const constructedJson = {
              imageCaption: imageCaptionMatch?.[1] || 'Produk Menarik - Lihat Selengkapnya!',
              salesCopy: salesCopyMatch?.[1] || 'Produk berkualitas dengan presentasi yang menarik.',
              hashtags: hashtags
            };
            
            return JSON.stringify(constructedJson);
          }
        }
        return null;
      },
      
      // Method 4: Try to construct JSON from key-value pairs
      () => {
        const titleMatch = jsonString.match(/["']?(?:title|imageCaption)["']?\s*:?\s*["']([^"'\n]+)["']/);
        const descMatch = jsonString.match(/["']?(?:description|salesCopy)["']?\s*:?\s*["']([^"'\n]+)["']/);
        const hashMatch = jsonString.match(/["']?hashtags["']?\s*:?\s*\[([^\]]+)\]/);
        
        if (titleMatch || descMatch) {
          let hashtags = ['#ProdukBerkualitas', '#JualOnline', '#PromoMenarik'];
          if (hashMatch) {
            hashtags = hashMatch[1]
              .split(',')
              .map(tag => tag.trim().replace(/["/]/g, '').replace(/^#?/, '#'))
              .filter(tag => tag.length > 1);
          }
          
          const constructedJson = {
            imageCaption: titleMatch?.[1] || 'Produk Menarik',
            salesCopy: descMatch?.[1] || 'Produk berkualitas tinggi.',
            hashtags: hashtags
          };
          
          return JSON.stringify(constructedJson);
        }
        return null;
      },
      
      // Method 5: Handle markdown-formatted responses with analysis sections
      () => {
        if (jsonString.includes('**imageCaption:**') || jsonString.includes('**Konten Marketing:**')) {
          // More flexible pattern matching for imageCaption
          const imageCaptionMatch = jsonString.match(/\*\*imageCaption:\*\*\s*["']([^"']+)["']/) ||
                                   jsonString.match(/\*\*imageCaption:\*\*\s*"([^"]+)"/) ||
                                   jsonString.match(/\*\*imageCaption:\*\*\s*([^\n*]+)/);
          
          // More flexible pattern matching for salesCopy - handle quoted content
          const salesCopyMatch = jsonString.match(/\*\*salesCopy:\*\*\s*\n\n"([\s\S]*?)"/) ||
                                jsonString.match(/\*\*salesCopy:\*\*\s*\n\n([\s\S]*?)(?=\n\*\*|$)/) ||
                                jsonString.match(/\*\*salesCopy:\*\*\s*([\s\S]*?)(?=\n\*\*hashtags|$)/);
          
          // More flexible pattern matching for hashtags - handle array format
          const hashtagsMatch = jsonString.match(/\*\*hashtags:\*\*\s*\[([^\]]+)\]/) ||
                               jsonString.match(/\*\*hashtags:\*\*\s*["']?([^"'\n]+)["']?/) ||
                               jsonString.match(/\*\*hashtags:\*\*\s*(.+?)(?=\n|$)/);
          
          if (imageCaptionMatch || salesCopyMatch) {
            let hashtags = ['#ProdukBerkualitas', '#JualOnline', '#PromoMenarik', '#KeindahanAlam'];
            
            if (hashtagsMatch) {
              const hashtagString = hashtagsMatch[1] || hashtagsMatch[2] || '';
              // Handle both comma-separated and space-separated hashtags
              hashtags = hashtagString
                .replace(/["\'\[\]]/g, '') // Remove quotes and brackets
                .split(/\s*,\s*|\s+/)
                .map(tag => tag.trim().replace(/^#?/, '#'))
                .filter(tag => tag.length > 1 && tag !== '#');
              
              // Fallback if no valid hashtags found
              if (hashtags.length === 0) {
                hashtags = ['#ProdukBerkualitas', '#JualOnline', '#PromoMenarik', '#KeindahanAlam'];
              }
            }
            
            // Clean up the salesCopy by removing markdown formatting and control characters
            let salesCopy = salesCopyMatch?.[1] || salesCopyMatch?.[2] || 'Produk berkualitas dengan presentasi yang menarik.';
            salesCopy = salesCopy
              .replace(/\*\*[^*]*\*\*/g, '') // Remove **text**
              .replace(/\*[^*]*\*/g, '') // Remove *text*
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/�[�-�]|\ud83d[�-��-�]|[\u2600-\u26FF\u2700-\u27BF]/g, '') // Remove emojis that cause issues
              .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
              .trim();
            
            // Ensure no problematic characters in the title
            const cleanTitle = (imageCaptionMatch?.[1] || imageCaptionMatch?.[2] || imageCaptionMatch?.[3] || 'Produk Menarik')
              .replace(/["'\n\r\t]/g, '')
              .trim();
            
            const constructedJson = {
              imageCaption: cleanTitle,
              salesCopy: salesCopy,
              hashtags: hashtags
            };
            
            return JSON.stringify(constructedJson);
          }
        }
        return null;
      },
      
      // Method 6: Handle cases where AI refuses or provides non-JSON responses
      () => {
        if (jsonString.toLowerCase().includes("not able to help") ||
            jsonString.toLowerCase().includes("can't help") ||
            jsonString.toLowerCase().includes("unable to assist")) {
          // Create a generic fallback based on typical product scenarios
          const constructedJson = {
            imageCaption: 'Produk Istimewa - Siap Dipromosikan',
            salesCopy: 'Produk berkualitas tinggi dengan desain menarik dan fungsionalitas yang optimal. Cocok untuk berbagai kebutuhan dan memberikan nilai lebih bagi penggunanya.',
            hashtags: ['#ProdukBerkualitas', '#JualOnline', '#PromoSpesial', '#KualitasTerbaik', '#ProductOfTheDay']
          };
          
          return JSON.stringify(constructedJson);
        }
        return null;
      }
    ];
    
    // Try each extraction method
    for (let i = 0; i < extractionMethods.length; i++) {
      try {
        const extractedJson = extractionMethods[i]();
        if (extractedJson) {
          // Clean the JSON string more thoroughly
          let cleanedJson = extractedJson
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\n/g, '\n') // Fix newlines
            .replace(/\\t/g, ' ') // Replace tabs with spaces
            .replace(/\\r/g, '') // Remove carriage returns
            .replace(/([^\\])\n/g, '$1\\n') // Escape unescaped newlines in strings
            .trim();
          
          // Additional cleaning for malformed JSON
          // Fix common issues with escaped characters
          cleanedJson = cleanedJson
            .replace(/\\\\/g, '/') // Fix double-escaped forward slashes
            .replace(/\\(?!["'\\nrtfb/])/g, '\\\\') // Properly escape unrecognized escape sequences
            .replace(/"\s*:\s*"([^"\n]*?)\\\s*$/gm, '"$1"') // Fix trailing backslashes in string values
            .replace(/"\s*:\s*"([^"]*?)\\"\s*([,}])/g, '"$1"$2') // Fix escaped quotes at end of strings
            .replace(/("salesCopy"\s*:\s*"[^"]*?)\\(\s*\n)/g, '$1\\\\$2'); // Fix specific issue with backslash in salesCopy
          
          parsed = JSON.parse(cleanedJson);
          break;
        }
      } catch {
        continue;
      }
    }
    
    // If no method worked, throw error with detailed info
    if (!parsed) {
      throw new Error(`Could not extract valid JSON from AI response. Response was: ${result.substring(0, 500)}${result.length > 500 ? '...' : ''}`);
    }
    
    // Validate the response structure with new field names
    const validatedResponse = GenerateSalesContentOutputSchema.parse({
      title: parsed?.imageCaption || 'Produk Menarik - Lihat Selengkapnya!',
      description: parsed?.salesCopy || 'Produk berkualitas dengan presentasi yang menarik. Cocok untuk kebutuhan Anda dengan kualitas terjamin.',
      hashtags: Array.isArray(parsed?.hashtags) ? parsed.hashtags : [
        '#ProdukBerkualitas',
        '#JualOnline', 
        '#PromoMenarik',
        '#KualitasTerbaik',
        '#ProductOfTheDay',
        '#ShoppingOnline',
        '#TerpercayaShop',
        '#Indonesia'
      ]
    });
    return JSON.parse(JSON.stringify(validatedResponse));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to provide a more specific fallback based on the error type
    let fallbackTitle = 'Produk Menarik - Siap Dipromosikan!';
    let fallbackDescription = `Terjadi kendala dalam analisis gambar secara detail, namun produk Anda memiliki potensi yang baik untuk dipromosikan.

🎆 KEUNGGULAN PRODUK:
• Gambar dengan kualitas yang memadai untuk promosi
• Format yang sesuai untuk platform digital
• Siap untuk dipasarkan secara online
• Cocok untuk berbagai channel marketing

🚀 STRATEGI PROMOSI:
• Gunakan sebagai material utama di media sosial
• Tambahkan deskripsi detail dan harga
• Optimalkan dengan hashtag yang relevan
• Promosikan di platform yang tepat

📞 LANGKAH SELANJUTNYA:
Siapkan informasi detail produk, tentukan harga yang kompetitif, dan mulai promosi di channel yang sesuai dengan target market Anda.

Hubungi tim support untuk bantuan optimasi konten yang lebih spesifik!`;
    
    // Customize fallback based on error type
    if (errorMessage.includes('JSON')) {
      fallbackTitle = 'Analisis Visual - Butuh Penyesuaian Manual';
      fallbackDescription = `Sistem berhasil menganalisis gambar namun memerlukan penyesuaian format respons.

✨ PANDUAN MANUAL:
• Gambar Anda sudah sesuai untuk promosi
• Identifikasi sendiri objek utama dalam gambar
• Sebutkan warna, bentuk, dan fitur menarik
• Buat deskripsi berdasarkan detail visual yang terlihat

🎯 TIPS KONTEN:
• Gunakan bahasa yang engaging dan personal
• Tambahkan benefit dan keunggulan produk
• Sertakan call-to-action yang kuat
• Sesuaikan dengan target audience

📝 FORMAT YANG DISARANKAN:
- Judul: Maksimal 80 karakter, menarik perhatian
- Deskripsi: 200-300 kata, detail fitur dan manfaat
- Hashtag: 8-10 hashtag relevan dengan produk

Silakan edit dan sesuaikan konten dengan produk spesifik Anda!`;
    } else if (errorMessage.includes('API') || errorMessage.includes('network')) {
      fallbackTitle = 'Koneksi Terputus - Coba Lagi Sebentar';
      fallbackDescription = `Terjadi gangguan koneksi saat menganalisis gambar.

🔄 SOLUSI CEPAT:
• Pastikan koneksi internet stabil
• Coba upload gambar lagi dalam beberapa menit
• Periksa format gambar (JPG, PNG, WebP)
• Pastikan ukuran gambar tidak terlalu besar

⚡ SEMENTARA INI:
• Buat deskripsi produk secara manual
• Fokus pada detail visual yang menarik
• Tambahkan keunggulan dan manfaat
• Gunakan hashtag yang relevan

📞 BANTUAN:
Jika masalah berlanjut, silakan hubungi tim support untuk bantuan teknis lebih lanjut.`;
    }
    
    // Return a comprehensive fallback response
    return JSON.parse(JSON.stringify({
      title: fallbackTitle,
      description: fallbackDescription,
      hashtags: [
        '#ProdukBerkualitas',
        '#JualOnline',
        '#PromosiProduk',
        '#BisnisOnline',
        '#MarketingDigital',
        '#ECommerce',
        '#JualanTerpercaya',
        '#Indonesia'
      ]
    }));
  }
}


/**
 * Enhanced version with proper image analysis (for future implementation)
 * This would require integration with a proper vision model
 */
export async function generateSalesContentWithVision(
  input: GenerateSalesContentInput
): Promise<GenerateSalesContentOutput> {
  // This function now uses actual image analysis!
  return generateSalesContent(input);
}
