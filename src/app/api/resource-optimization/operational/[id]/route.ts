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
    if (!body.department || !body.process_name) {
      return NextResponse.json({ 
        error: 'Department and process name are required' 
      }, { status: 400 });
    }

    // Prepare update data for operational metrics
    const updateData = {
      department: body.department,
      process_name: body.process_name,
      efficiency_rate: parseFloat(body.efficiency_rate) || 0,
      cycle_time: parseFloat(body.cycle_time) || 0,
      error_rate: parseFloat(body.error_rate) || 0,
      throughput: parseInt(body.throughput) || 0,
      capacity_utilization: parseFloat(body.capacity_utilization) || 0,
      quality_score: body.quality_score ? parseFloat(body.quality_score) : null,
      bottleneck_areas: body.bottleneck_areas || null,
      improvement_suggestions: body.improvement_suggestions || null,
      automation_level: body.automation_level || 'Low',
      cost_per_unit: body.cost_per_unit ? parseFloat(body.cost_per_unit) : null,
      updated_at: new Date().toISOString()
    };

    // First check if the record exists and belongs to the user
    const { data: existingRecord } = await supabase
      .from('operational_metrics')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Operational metric not found' }, { status: 404 });
    }

    // Update the operational metric
    const { data: operational, error } = await supabase
      .from('operational_metrics')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating operational metric:', error);
      return NextResponse.json({ error: 'Failed to update operational metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      operational,
      message: 'Operational metric updated successfully' 
    });
  } catch (error) {
    console.error('Operational metrics PUT error:', error);
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
      .from('operational_metrics')
      .select('id, process_name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Operational metric not found' }, { status: 404 });
    }

    // Delete the operational metric
    const { error } = await supabase
      .from('operational_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting operational metric:', error);
      return NextResponse.json({ error: 'Failed to delete operational metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Operational metric "${existingRecord.process_name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Operational metrics DELETE error:', error);
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

    const { data: operational, error } = await supabase
      .from('operational_metrics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching operational metric:', error);
      return NextResponse.json({ error: 'Operational metric not found' }, { status: 404 });
    }

    return NextResponse.json({ operational });
  } catch (error) {
    console.error('Operational metrics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
