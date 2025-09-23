import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    // Prepare update data
    const updateData = {
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

    // First check if the record exists and belongs to the user
    const { data: existingRecord } = await supabase
      .from('financial_insights')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }

    // Update the financial record
    const { data: financials, error } = await supabase
      .from('financial_insights')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating financial insight:', error);
      return NextResponse.json({ error: 'Failed to update financial data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      financials,
      message: 'Financial data updated successfully' 
    });
  } catch (error) {
    console.error('Financial insights PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First check if the record exists and belongs to the user
    const { data: existingRecord } = await supabase
      .from('financial_insights')
      .select('id, revenue, expenses')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }

    // Delete the financial record
    const { error } = await supabase
      .from('financial_insights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting financial insight:', error);
      return NextResponse.json({ error: 'Failed to delete financial data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Financial record with revenue ${existingRecord.revenue?.toLocaleString('id-ID') ?? 'N/A'} deleted successfully` 
    });
  } catch (error) {
    console.error('Financial insights DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: financials, error } = await supabase
      .from('financial_insights')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching financial insight:', error);
      return NextResponse.json({ error: 'Financial record not found' }, { status: 404 });
    }

    return NextResponse.json({ financials });
  } catch (error) {
    console.error('Financial insights GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}