import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: workforce, error } = await supabase
      .from('workforce_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workforce:', error);
      return NextResponse.json({ error: 'Failed to fetch workforce data' }, { status: 500 });
    }

    return NextResponse.json({ workforce });
  } catch (error) {
    console.error('Workforce GET error:', error);
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
    
    // Validate required fields for workforce metrics
    if (!body.metric_name || body.metric_value === undefined) {
      return NextResponse.json({ 
        error: 'Metric name and metric value are required' 
      }, { status: 400 });
    }

    // Prepare workforce metrics data
    const workforceData = {
      user_id: user.id,
      metric_name: body.metric_name,
      metric_value: parseFloat(body.metric_value) || 0,
      metric_date: body.metric_date || new Date().toISOString().split('T')[0]
    };

    const { data: workforce, error } = await supabase
      .from('workforce_metrics')
      .insert([workforceData])
      .select()
      .single();

    if (error) {
      console.error('Error creating workforce metric:', error);
      return NextResponse.json({ error: 'Failed to create workforce metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      workforce,
      message: 'Workforce metric created successfully' 
    });
  } catch (error) {
    console.error('Workforce POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}