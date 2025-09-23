import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getFinancialSummaryChartData } from '@/lib/supabase/financial-summaries';
import { generateIndustryChartData } from '@/lib/exa-financial-data';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for business context
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_type, company_name')
      .eq('id', user.id)
      .single();

    // Try to get real data first
    const chartData = await generateChartData(user.id, profile);

    return NextResponse.json({
      data: chartData.data,
      source: chartData.source,
      lastUpdated: chartData.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching financial chart data:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

interface ChartResult {
  data: ChartDataPoint[];
  source: 'real' | 'insights' | 'simulation';
  lastUpdated: string | null;
}

interface ProfileData {
  business_type?: string | null;
  company_name?: string | null;
}

async function generateChartData(userId: string, profile: ProfileData | null): Promise<ChartResult> {
  // Option 1: Try to get data from financial summaries (primary source)
  try {
    const summaryData = await getFinancialSummaryChartData(userId)
    if (summaryData.chartData.length > 0) {
      return {
        data: summaryData.chartData,
        source: 'real',
        lastUpdated: summaryData.lastUpdated
      }
    }
  } catch {
    console.log('No financial summaries found, trying EXA industry data...')
  }

  // Option 2: Generate EXA-based simulation data based on business type
  const exaData = generateIndustryChartData(profile?.business_type)
  return {
    data: exaData,
    source: 'simulation',
    lastUpdated: null
  }
}
