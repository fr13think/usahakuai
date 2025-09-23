import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: financials, error } = await supabase
      .from('financial_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial insights:', error);
      return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }

    return NextResponse.json({ financials });
  } catch (error) {
    console.error('Financial insights GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (body.revenue === undefined || body.expenses === undefined) {
      return NextResponse.json({ 
        error: 'Revenue and expenses are required' 
      }, { status: 400 });
    }

    // Validate data types
    if (typeof body.revenue !== 'number' || typeof body.expenses !== 'number') {
      return NextResponse.json({ 
        error: 'Revenue and expenses must be numbers' 
      }, { status: 400 });
    }

    // Prepare financial data
    const financialData = {
      user_id: user.id,
      revenue: body.revenue,
      expenses: body.expenses,
      assets: body.assets || null,
      liabilities: body.liabilities || null,
      market_trends: body.market_trends || null,
      business_goals: body.business_goals || null,
      cash_flow_analysis: body.cash_flow_analysis || null,
      profitability_analysis: body.profitability_analysis || null,
      investment_opportunities: body.investment_opportunities || null,
      recommendations: body.recommendations || null
    };

    const { data: financials, error } = await supabase
      .from('financial_insights')
      .insert([financialData])
      .select()
      .single();

    if (error) {
      console.error('Error creating financial insight:', error);
      return NextResponse.json({ error: 'Failed to create financial data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      financials,
      message: 'Financial data created successfully' 
    });
  } catch (error) {
    console.error('Financial insights POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}