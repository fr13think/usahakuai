import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: operations, error } = await supabase
      .from('operational_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching operational metrics:', error);
      return NextResponse.json({ error: 'Failed to fetch operational metrics' }, { status: 500 });
    }

    return NextResponse.json({ operations: operations || [] });
  } catch (error) {
    console.error('Operational metrics GET error:', error);
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
    if (!body.department || !body.process_name) {
      return NextResponse.json({ 
        error: 'Department and process name are required' 
      }, { status: 400 });
    }

    // Prepare operational metrics data
    const operationalData = {
      user_id: user.id,
      department: body.department,
      process_name: body.process_name,
      efficiency_rate: body.efficiency_rate || 0,
      cycle_time: body.cycle_time || 0,
      error_rate: body.error_rate || 0,
      throughput: body.throughput || 0,
      capacity_utilization: body.capacity_utilization || 0,
      quality_score: body.quality_score || null,
      bottleneck_areas: body.bottleneck_areas || null,
      improvement_suggestions: body.improvement_suggestions || null,
      automation_level: body.automation_level || 'Low',
      cost_per_unit: body.cost_per_unit || null
    };

    const { data: operational, error } = await supabase
      .from('operational_metrics')
      .insert([operationalData])
      .select()
      .single();

    if (error) {
      console.error('Error creating operational metric:', error);
      return NextResponse.json({ error: 'Failed to create operational metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      operational,
      message: 'Operational metric created successfully' 
    });
  } catch (error) {
    console.error('Operational metrics POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
