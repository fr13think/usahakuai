// EXA Search helper for financial data simulation based on business type
// This is a simplified version - in production you would use actual EXA API

interface IndustryFinancialData {
  avgRevenue: number
  avgExpenses: number
  commonCategories: string[]
  seasonalPatterns: number[]
  profitMargin: number
}

const INDUSTRY_DATA: Record<string, IndustryFinancialData> = {
  retail: {
    avgRevenue: 250000000, // 250M IDR annually
    avgExpenses: 200000000, // 200M IDR annually
    commonCategories: ['Penjualan Produk', 'Biaya Barang', 'Sewa Toko', 'Gaji Karyawan', 'Marketing'],
    seasonalPatterns: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3], // Higher in later months
    profitMargin: 0.2
  },
  manufaktur: {
    avgRevenue: 500000000, // 500M IDR annually
    avgExpenses: 400000000, // 400M IDR annually
    commonCategories: ['Penjualan Produk', 'Bahan Baku', 'Biaya Produksi', 'Overhead Pabrik', 'Distribusi'],
    seasonalPatterns: [1.0, 1.0, 1.1, 1.1, 1.0, 0.9], // Steady with slight variations
    profitMargin: 0.2
  },
  jasa: {
    avgRevenue: 150000000, // 150M IDR annually
    avgExpenses: 100000000, // 100M IDR annually
    commonCategories: ['Pendapatan Jasa', 'Gaji Konsultan', 'Biaya Operasional', 'Marketing', 'Teknologi'],
    seasonalPatterns: [0.9, 1.0, 1.1, 1.2, 1.1, 1.0], // Peak in middle months
    profitMargin: 0.33
  },
  teknologi: {
    avgRevenue: 300000000, // 300M IDR annually
    avgExpenses: 200000000, // 200M IDR annually
    commonCategories: ['Subscription Revenue', 'Development Cost', 'Server & Cloud', 'Marketing Digital', 'R&D'],
    seasonalPatterns: [1.0, 1.1, 1.2, 1.3, 1.2, 1.1], // Growing trend
    profitMargin: 0.33
  },
  makanan: {
    avgRevenue: 200000000, // 200M IDR annually
    avgExpenses: 150000000, // 150M IDR annually
    commonCategories: ['Penjualan F&B', 'Bahan Baku', 'Sewa Tempat', 'Gaji Chef & Staff', 'Utilitas'],
    seasonalPatterns: [0.9, 0.8, 1.0, 1.1, 1.3, 1.2], // Higher during holiday seasons
    profitMargin: 0.25
  },
  pendidikan: {
    avgRevenue: 100000000, // 100M IDR annually
    avgExpenses: 80000000, // 80M IDR annually
    commonCategories: ['Uang Sekolah', 'Gaji Guru', 'Fasilitas', 'Buku & Materi', 'Administrasi'],
    seasonalPatterns: [1.3, 1.0, 0.7, 0.8, 0.9, 1.2], // Peak at school year start
    profitMargin: 0.2
  },
  kesehatan: {
    avgRevenue: 400000000, // 400M IDR annually
    avgExpenses: 300000000, // 300M IDR annually
    commonCategories: ['Konsultasi Medis', 'Peralatan Medis', 'Gaji Medis', 'Obat-obatan', 'Fasilitas'],
    seasonalPatterns: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // Consistent demand
    profitMargin: 0.25
  }
}

const DEFAULT_INDUSTRY_DATA: IndustryFinancialData = {
  avgRevenue: 200000000,
  avgExpenses: 150000000,
  commonCategories: ['Pendapatan', 'Biaya Operasional', 'Gaji Karyawan', 'Marketing', 'Administrasi'],
  seasonalPatterns: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  profitMargin: 0.25
}

export interface SimulatedChartData {
  month: string
  revenue: number
  expenses: number
}

export interface SimulatedTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

// Get industry data based on business type
export function getIndustryData(businessType?: string | null): IndustryFinancialData {
  if (!businessType) return DEFAULT_INDUSTRY_DATA
  
  const normalizedType = businessType.toLowerCase()
  
  // Try exact match first
  if (INDUSTRY_DATA[normalizedType]) {
    return INDUSTRY_DATA[normalizedType]
  }
  
  // Try partial matches
  for (const [key, data] of Object.entries(INDUSTRY_DATA)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return data
    }
  }
  
  return DEFAULT_INDUSTRY_DATA
}

// Generate chart data based on industry patterns
export function generateIndustryChartData(businessType?: string | null): SimulatedChartData[] {
  const industryData = getIndustryData(businessType)
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni']
  
  return months.map((month, index) => {
    // Monthly revenue (annual revenue / 12 * seasonal pattern)
    const baseMonthlyRevenue = industryData.avgRevenue / 12
    const seasonalMultiplier = industryData.seasonalPatterns[index] || 1.0
    const randomVariation = 0.8 + (Math.random() * 0.4) // ±20% variation
    
    const revenue = Math.round((baseMonthlyRevenue * seasonalMultiplier * randomVariation) / 1000) // Convert to thousands
    
    // Expenses are typically 70-90% of revenue based on profit margin
    const expenseRatio = 1 - industryData.profitMargin
    const expenses = Math.round(revenue * expenseRatio * (0.9 + Math.random() * 0.2)) // Add some variation
    
    return {
      month,
      revenue,
      expenses
    }
  })
}

// Generate detailed transactions based on industry type
export function generateIndustryTransactions(businessType?: string | null): SimulatedTransaction[] {
  const industryData = getIndustryData(businessType)
  const transactions: SimulatedTransaction[] = []
  const categories = industryData.commonCategories
  
  // Generate transactions for the last 3 months
  const months = [5, 4, 3] // May, April, March (0-indexed)
  const currentYear = new Date().getFullYear()
  
  months.forEach(monthIndex => {
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate()
    const baseMonthlyRevenue = industryData.avgRevenue / 12
    const baseMonthlyExpenses = industryData.avgExpenses / 12
    
    // Generate 5-15 transactions per month
    const transactionCount = 5 + Math.floor(Math.random() * 10)
    
    for (let i = 0; i < transactionCount; i++) {
      const isIncome = Math.random() > 0.7 // 30% income, 70% expenses
      const day = Math.floor(Math.random() * daysInMonth) + 1
      const date = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      let amount: number
      let category: string
      let description: string
      
      if (isIncome) {
        amount = Math.floor(baseMonthlyRevenue * (0.1 + Math.random() * 0.5)) // 10-60% of monthly revenue
        category = categories[0] // First category is usually main revenue
        description = `${category} - ${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`
      } else {
        amount = -Math.floor(baseMonthlyExpenses * (0.05 + Math.random() * 0.3)) // 5-35% of monthly expenses
        category = categories[1 + Math.floor(Math.random() * (categories.length - 1))] // Random expense category
        description = `${category} - ${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`
      }
      
      transactions.push({
        id: `exa_${Date.now()}_${i}_${monthIndex}`,
        date,
        description,
        amount,
        type: isIncome ? 'income' : 'expense',
        category
      })
    }
  })
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get industry insights
export function generateIndustryInsights(businessType?: string | null): string[] {
  const industryData = getIndustryData(businessType)
  const normalizedType = businessType?.toLowerCase() || 'umum'
  
  const insights = [
    `Berdasarkan data industri ${normalizedType}, margin keuntungan rata-rata adalah ${(industryData.profitMargin * 100).toFixed(0)}%.`,
    `Industri ${normalizedType} menunjukkan pola seasonal dengan variasi pendapatan sepanjang tahun.`,
    `Kategori pengeluaran utama meliputi: ${industryData.commonCategories.slice(1, 4).join(', ')}.`
  ]
  
  // Add business-specific insights
  if (normalizedType.includes('retail') || normalizedType.includes('toko')) {
    insights.push('Perhatikan tren seasonal terutama menjelang akhir tahun untuk memaksimalkan penjualan.')
    insights.push('Kelola inventory dengan baik untuk menghindari dead stock.')
  } else if (normalizedType.includes('teknologi') || normalizedType.includes('software')) {
    insights.push('Investasi R&D yang konsisten penting untuk pertumbuhan jangka panjang.')
    insights.push('Model subscription dapat memberikan pendapatan yang lebih stabil.')
  } else if (normalizedType.includes('jasa') || normalizedType.includes('konsultan')) {
    insights.push('Fokus pada retention klien untuk mengurangi biaya akuisisi.')
    insights.push('Standardisasi proses untuk meningkatkan efisiensi operasional.')
  }
  
  return insights
}

// Main function to get complete financial simulation
export function generateIndustryFinancialData(businessType?: string | null): {
  chartData: SimulatedChartData[]
  transactions: SimulatedTransaction[]
  insights: string[]
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    transactionCount: number
  }
} {
  const chartData = generateIndustryChartData(businessType)
  const transactions = generateIndustryTransactions(businessType)
  const insights = generateIndustryInsights(businessType)
  
  // Calculate summary from transactions
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  return {
    chartData,
    transactions,
    insights,
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      transactionCount: transactions.length
    }
  }
}