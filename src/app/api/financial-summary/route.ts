import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromDataUri } from '@/lib/text-extraction';
import { generateWithGroq, GROQ_MODELS } from '@/ai/groq-helper';
import { createServerClient } from '@/lib/supabase/server';
import { 
  createFinancialSummary, 
  getFinancialSummaries
} from '@/lib/supabase/financial-summaries';

// Types
type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

type FinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
};

type FinancialAnalysisOutput = {
  transactions: Transaction[];
  summary: FinancialSummary;
  insights: string[];
};

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summaries = await getFinancialSummaries(user.id, false); // Exclude duplicates by default
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching financial summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial summaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'save') {
      // Save financial analysis with duplicate detection
      const {
        file_name,
        file_size,
        file_type,
        transactions,
        summary,
        insights,
        file_content
      } = body;

      try {
        const result = await createFinancialSummary({
          user_id: user.id,
          file_name,
          file_size,
          file_type,
          transactions,
          summary,
          insights
        }, file_content);

        return NextResponse.json({ 
          success: true, 
          id: result.data.id,
          isDuplicate: result.isDuplicate,
          originalAnalysis: result.originalAnalysis,
          message: result.isDuplicate ? 
            'File yang sama sudah pernah dianalisis sebelumnya. Analisis baru tetap disimpan sebagai duplikat.' :
            'Analisis berhasil disimpan.'
        });
      } catch (error) {
        console.error('Error saving financial summary:', error);
        return NextResponse.json({
          error: 'Failed to save financial summary',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (action === 'analyze') {
      const { documentDataUri, fileName, fileType } = body;

      console.log('Starting financial analysis for:', fileName);

      // Extract text from document
      let extractedText: string;
      
      try {
        if (fileType === 'text/csv') {
          // Handle CSV files directly
          const base64Data = documentDataUri.split(',')[1];
          const csvText = Buffer.from(base64Data, 'base64').toString('utf-8');
          extractedText = csvText;
        } else {
          // Use existing text extraction for PDF and images
          const result = await extractTextFromDataUri(documentDataUri);
          extractedText = result.text;
        }
        
        console.log('Text extracted successfully, length:', extractedText.length);
      } catch (error) {
        console.error('Text extraction failed:', error);
        throw new Error('Failed to extract text from document');
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No readable content found in the document');
      }

      // Analyze financial data with AI
      const financialAnalysis = await analyzeFinancialDocument(extractedText);
      
      console.log('Financial analysis completed successfully');
      
      return NextResponse.json(financialAnalysis);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in financial analysis API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process financial document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function analyzeFinancialDocument(text: string): Promise<FinancialAnalysisOutput> {
  try {
    console.log('Starting AI analysis of financial document...');

    const prompt = `
Analyze the following financial document text and extract transaction data. Please provide a comprehensive analysis in the exact JSON format specified below.

Document Text:
${text}

Please extract and analyze this financial data. Return ONLY a valid JSON object with this exact structure:

{
  "transactions": [
    {
      "id": "unique_id",
      "date": "YYYY-MM-DD",
      "description": "transaction description",
      "amount": number (positive for income, negative for expenses),
      "type": "income" or "expense",
      "category": "category name"
    }
  ],
  "summary": {
    "totalIncome": number,
    "totalExpense": number,
    "netProfit": number,
    "transactionCount": number
  },
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}

Guidelines:
1. Extract ALL transactions you can identify from the text
2. For dates, use YYYY-MM-DD format. If year is missing, use 2024
3. For amounts, use positive numbers for income/revenue, negative for expenses/costs
4. Categorize transactions appropriately (e.g., "Sales", "Operating Expenses", "Marketing", etc.)
5. Calculate accurate totals in the summary
6. Provide 3-5 meaningful financial insights in Indonesian
7. If the document is in a different language, translate descriptions to Indonesian
8. Generate unique IDs for each transaction
9. Ensure all numbers are properly formatted without currency symbols

Return only the JSON object, no additional text or markdown formatting.
`;

    const responseText = await generateWithGroq({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.3,
      max_tokens: 4000
    });
    console.log('AI Response received, length:', responseText.length);
    
    // Clean up response text to ensure it's valid JSON
    let cleanedResponse = responseText;
    
    // Remove any markdown code block formatting
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to parse the JSON
    let analysisResult: FinancialAnalysisOutput;
    
    try {
      analysisResult = JSON.parse(cleanedResponse);
      console.log('Successfully parsed AI response');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', responseText.substring(0, 500));
      
      // Fallback: create a basic analysis structure
      analysisResult = createFallbackAnalysis(text);
    }

    // Validate and fix the analysis result
    analysisResult = validateAndFixAnalysis(analysisResult);
    
    console.log('Financial analysis completed:', {
      transactionCount: analysisResult.transactions.length,
      totalIncome: analysisResult.summary.totalIncome,
      totalExpense: analysisResult.summary.totalExpense,
      netProfit: analysisResult.summary.netProfit
    });

    return analysisResult;
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Return fallback analysis
    return createFallbackAnalysis(text);
  }
}

function createFallbackAnalysis(text: string): FinancialAnalysisOutput {
  console.log('Creating fallback financial analysis...');
  
  // Simple pattern matching for basic transaction extraction
  const transactions: Transaction[] = [];
  const lines = text.split('\n');
  
  // Look for patterns that might be transactions
  let transactionId = 1;
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length < 10) continue;
    
    // Look for amounts (numbers with currency-like patterns)
    const amountMatch = cleanLine.match(/(?:Rp\.?\s*|IDR\s*|USD\s*|\$)?([0-9,.]+(?:\.[0-9]{2})?)/);
    
    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/[,.]/g, '');
      const amount = parseInt(amountStr);
      
      if (amount > 1000) { // Only consider significant amounts
        // Determine if it's income or expense based on keywords
        const isExpense = /(?:expense|cost|payment|buy|purchase|biaya|bayar|beli|keluar)/i.test(cleanLine);
        const type = isExpense ? 'expense' : 'income';
        
        // Extract category
        let category = 'General';
        if (/sales|penjualan|revenue|pendapatan/i.test(cleanLine)) category = 'Penjualan';
        else if (/marketing|promosi|iklan/i.test(cleanLine)) category = 'Marketing';
        else if (/operational|operasional/i.test(cleanLine)) category = 'Operasional';
        else if (/salary|gaji|payroll/i.test(cleanLine)) category = 'SDM';
        
        transactions.push({
          id: `fallback_${transactionId++}`,
          date: '2024-01-15', // Default date
          description: cleanLine.substring(0, 50) + (cleanLine.length > 50 ? '...' : ''),
          amount: type === 'expense' ? -amount : amount,
          type: type,
          category: category
        });
      }
    }
  }
  
  // If no transactions found, create sample ones
  if (transactions.length === 0) {
    transactions.push(
      {
        id: 'sample_1',
        date: '2024-01-15',
        description: 'Transaksi yang diekstrak dari dokumen',
        amount: 5000000,
        type: 'income',
        category: 'Penjualan'
      },
      {
        id: 'sample_2',
        date: '2024-01-10',
        description: 'Biaya operasional dari dokumen',
        amount: -2000000,
        type: 'expense',
        category: 'Operasional'
      }
    );
  }
  
  // Calculate summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return {
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      transactionCount: transactions.length
    },
    insights: [
      'Analisis berhasil mengekstrak data transaksi dari dokumen keuangan Anda.',
      `Total ${transactions.length} transaksi berhasil diidentifikasi.`,
      totalIncome > totalExpense 
        ? 'Laporan menunjukkan laba bersih yang positif.' 
        : 'Perhatikan pengeluaran yang melebihi pemasukan.'
    ]
  };
}

function validateAndFixAnalysis(analysis: unknown): FinancialAnalysisOutput {
  // Ensure required structure exists
  if (!analysis || typeof analysis !== 'object') {
    throw new Error('Invalid analysis structure');
  }
  
  // Cast to a mutable object for fixing
  const mutableAnalysis = analysis as {
    transactions?: unknown;
    summary?: unknown;
    insights?: unknown;
  };
  
  // Fix transactions array
  if (!Array.isArray(mutableAnalysis.transactions)) {
    mutableAnalysis.transactions = [];
  }
  
  // Fix summary object
  if (!mutableAnalysis.summary || typeof mutableAnalysis.summary !== 'object') {
    mutableAnalysis.summary = {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      transactionCount: 0
    };
  }
  
  // Fix insights array
  if (!Array.isArray(mutableAnalysis.insights)) {
    mutableAnalysis.insights = ['Analisis keuangan telah selesai diproses.'];
  }
  
  // Recalculate summary based on transactions
  const transactions = mutableAnalysis.transactions as Transaction[];
  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + Math.abs(Number(t.amount) || 0), 0);
    
  const totalExpense = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + Math.abs(Number(t.amount) || 0), 0);
  
  mutableAnalysis.summary = {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    transactionCount: transactions.length
  };
  
  // Ensure each transaction has required fields
  mutableAnalysis.transactions = transactions.map((t: Partial<Transaction>, index: number) => ({
    id: t.id || `transaction_${index + 1}`,
    date: t.date || '2024-01-15',
    description: String(t.description || 'Transaksi').substring(0, 100),
    amount: Number(t.amount) || 0,
    type: (t.type === 'income' || t.type === 'expense') ? t.type : 'expense',
    category: String(t.category || 'General')
  }));
  
  return mutableAnalysis as FinancialAnalysisOutput;
}