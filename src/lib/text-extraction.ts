// Real text extraction utilities with robust PDF parsing
import PDFParser from 'pdf2json';

/**
 * Clean and prepare extracted text for analysis
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim();
}

export interface ExtractedText {
  text: string;
  confidence?: number;
  pages?: number;
  elements?: string[];
  isScanned?: boolean;
}

/**
 * Extract text from a data URI (base64 encoded file)
 */
export async function extractTextFromDataUri(dataUri: string): Promise<ExtractedText> {
  try {
    // Parse the data URI
    const [header, data] = dataUri.split(',');
    if (!header || !data) {
      throw new Error('Invalid data URI format');
    }

    const mimeMatch = header.match(/data:([^;]+)/);
    if (!mimeMatch) {
      throw new Error('Could not determine file type from data URI');
    }

    const mimeType = mimeMatch[1].toLowerCase();
    const buffer = Buffer.from(data, 'base64');
    
    console.log(`Processing ${mimeType} file of ${buffer.length} bytes...`);
    
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(buffer);
    } else if (mimeType.startsWith('image/')) {
      // For images, we'll return guidance to use client-side OCR
      return await provideImageOCRGuidance();
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error in extractTextFromDataUri:', error);
    throw error;
  }
}

/**
 * Extract text from PDF buffer using robust pdf2json with retry logic
 */
async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedText> {
  console.log('Extracting text from PDF using enhanced pdf2json...');
  
  // Try multiple times with different configurations
  const configs = [
    { verbosity: 0, maxPages: 0 }, // Default config
    { verbosity: 1, maxPages: 10 }, // Limited pages with verbose logging
    { verbosity: 0, maxPages: 5 }   // Very limited pages
  ];
  
  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`Attempt ${i + 1}/${configs.length} with config:`, configs[i]);
      const result = await extractWithRobustPdf2Json(buffer, configs[i]);
      
      // Check if we got meaningful text
      if (result.text && result.text.trim().length > 10) {
        console.log(`Successfully extracted ${result.text.length} characters on attempt ${i + 1}`);
        return result;
      }
      
      console.log(`Attempt ${i + 1} returned minimal text, trying next config...`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error instanceof Error ? error.message : error);
      const currentError = error instanceof Error ? error : new Error(String(error));
      console.log('Extraction attempt failed:', currentError.message);
    }
  }

  // If all attempts failed, return scanned PDF guidance
  console.log('All PDF parsing attempts failed, assuming scanned PDF or corrupted file');
  return getScannedPdfGuidance();
}

/**
 * Enhanced PDF extraction using pdf2json with robust error handling
 */
async function extractWithRobustPdf2Json(
  buffer: Buffer, 
  config: { verbosity: number; maxPages: number }
): Promise<ExtractedText> {
  return new Promise((resolve, reject) => {
    try {
      // Create parser with specific configuration
      const pdfParser = new (PDFParser as unknown as new (arg1: null, arg2: number) => {
        on: (event: string, callback: (data: unknown) => void) => void;
        parseBuffer: (buffer: Buffer) => void;
      })(null, config.verbosity);
      
      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        reject(new Error('PDF parsing timeout - file may be corrupted or too complex'));
      }, 30000); // 30 second timeout
      
      // Handle successful parsing
      pdfParser.on('pdfParser_dataReady', (pdfData: unknown) => {
        clearTimeout(timeoutId);
        
        try {
          const data = pdfData as { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> };
          let extractedText = '';
          let totalPages = 0;
          let processedPages = 0;
          
          if (data && data.Pages && Array.isArray(data.Pages)) {
            totalPages = data.Pages.length;
            const maxPages = config.maxPages || totalPages;
            const pagesToProcess = Math.min(totalPages, maxPages);
            
            console.log(`Processing ${pagesToProcess}/${totalPages} pages`);
            
            // Extract text from each page
            for (let pageIndex = 0; pageIndex < pagesToProcess; pageIndex++) {
              const page = data.Pages[pageIndex];
              processedPages++;
              
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const textObj of page.Texts) {
                  if (textObj.R && Array.isArray(textObj.R)) {
                    for (const textRun of textObj.R) {
                      if (textRun.T) {
                        try {
                          // Decode URI components and clean up text
                          const decodedText = decodeURIComponent(textRun.T);
                          extractedText += decodedText + ' ';
                        } catch (decodeError) {
                          // If decoding fails, use raw text
                          console.warn('Text decode error, using raw text:', decodeError);
                          extractedText += textRun.T + ' ';
                        }
                      }
                    }
                  }
                }
                extractedText += '\n'; // Add line break after each page
              }
            }
            
            if (processedPages < totalPages) {
              extractedText += `\n[Note: Only processed ${processedPages}/${totalPages} pages due to configuration limits]`;
            }
          }
          
          // Clean up the extracted text
          extractedText = cleanExtractedText(extractedText);
          
          console.log(`Processed ${processedPages} pages, extracted ${extractedText.length} characters`);
          
          resolve({
            text: extractedText,
            pages: totalPages,
            elements: ['pdf_content']
          });
          
        } catch (parseError) {
          clearTimeout(timeoutId);
          console.error('Error processing PDF data:', parseError);
          reject(new Error(`Failed to process PDF content: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
        }
      });
      
      // Handle parsing errors with more detailed error messages
      pdfParser.on('pdfParser_dataError', (errData: unknown) => {
        clearTimeout(timeoutId);
        
        const errorData = errData as { parserError?: string };
        const errorMessage = errorData?.parserError || 'Unknown parsing error';
        console.error('PDF Parser Error Details:', errData);
        
        // Provide specific error messages for common issues
        if (errorMessage.includes('Invalid XRef stream header')) {
          reject(new Error('PDF file has corrupted cross-reference table. This often happens with damaged or non-standard PDF files.'));
        } else if (errorMessage.includes('Password')) {
          reject(new Error('PDF file is password protected and cannot be processed.'));
        } else if (errorMessage.includes('Unsupported')) {
          reject(new Error('PDF file uses unsupported features or encryption.'));
        } else {
          reject(new Error(`Failed to parse PDF: ${errorMessage}`));
        }
      });
      
      // Parse the PDF buffer
      console.log(`Starting PDF parsing with ${config.maxPages || 'unlimited'} page limit...`);
      pdfParser.parseBuffer(buffer);
      
    } catch (error) {
      reject(new Error(`Failed to initialize PDF parser: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}


/**
 * Return guidance for problematic PDFs
 */
function getScannedPdfGuidance(): ExtractedText {
  return {
    text: `MASALAH PDF TERDETEKSI - SOLUSI TERSEDIA

Sistem mencoba beberapa metode untuk membaca PDF Anda, namun mengalami kendala. Hal ini bisa terjadi karena:

🚨 KEMUNGKINAN PENYEBAB:
• PDF rusak atau tidak standar
• PDF berisi scan/gambar tanpa teks
• PDF menggunakan enkripsi atau proteksi
• Struktur PDF terlalu kompleks

🔧 SOLUSI YANG BISA DICOBA:

1. KONVERSI KE GAMBAR (DIREKOMENDASIKAN):
   • Screenshot halaman PDF yang ingin dianalisis
   • Save sebagai JPG atau PNG
   • Upload gambar untuk proses OCR otomatis
   • Sistem OCR kami sangat akurat untuk teks Indonesia

2. PDF ALTERNATIF:
   • Coba PDF dari sumber lain jika tersedia
   • Pastikan PDF tidak terproteksi password
   • Gunakan PDF yang dibuat dari aplikasi (Word, Excel, dll)

3. INPUT MANUAL:
   • Copy-paste teks dari PDF ke notepad
   • Input teks melalui form di sistem kami
   • AI tetap bisa memberikan analisis lengkap

✅ TIPS UNTUK HASIL OPTIMAL:
• Gunakan gambar dengan resolusi tinggi (minimal 300 DPI)
• Pastikan teks jelas dan tidak blur
• Orientasi dokumen harus tegak
• Background putih dengan teks hitam optimal

🚀 FITUR OCR CANGGIH:
Sistem kami mendukung OCR untuk Bahasa Indonesia dan Inggris dengan akurasi tinggi. Upload sebagai gambar untuk hasil terbaik!`,
    pages: 1,
    isScanned: true,
    elements: ['pdf_processing_guidance']
  };
}

/**
 * Provide guidance for image OCR processing
 */
async function provideImageOCRGuidance(): Promise<ExtractedText> {
  const guidance = `PANDUAN ANALISIS GAMBAR DOKUMEN

Gambar dokumen akan diproses menggunakan OCR (Optical Character Recognition) langsung di browser Anda.

🔄 PROSES OTOMATIS:
• Sistem akan mendeteksi teks dalam gambar
• OCR berjalan di browser (tidak dikirim ke server)
• Hasil teks akan dianalisis oleh AI
• Progress akan ditampilkan selama proses

📋 TIPS UNTUK HASIL TERBAIK:

1. KUALITAS GAMBAR:
   • Gunakan resolusi tinggi (minimal 300 DPI)
   • Pastikan pencahayaan merata
   • Hindari bayangan atau refleksi
   • Orientasi dokumen harus tegak

2. FORMAT DOKUMEN:
   • Teks hitam pada background putih optimal
   • Hindari background berwarna atau bertexture
   • Font yang jelas dan tidak terlalu kecil
   • Hindari tulisan tangan yang tidak jelas

3. KOMPATIBILITAS:
   • Format: JPG, PNG, GIF, BMP, WEBP
   • Ukuran maksimal: 10MB
   • Bahasa: Indonesia dan Inggris
   • Jenis dokumen: Faktur, laporan, kontrak, dll

⚡ PROSES SELANJUTNYA:
Setelah teks berhasil diekstrak dari gambar:
• Sistem AI akan menganalisis konten
• Memberikan ringkasan dokumen
• Mengidentifikasi poin-poin kunci  
• Memberikan rekomendasi bisnis

Silakan tunggu proses OCR selesai, atau upload ulang dengan gambar yang lebih berkualitas jika diperlukan.`;

  return {
    text: guidance.trim(),
    confidence: 0.95,
    elements: ['ocr_processing_info']
  };
}

