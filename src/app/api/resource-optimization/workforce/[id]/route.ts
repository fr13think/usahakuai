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
    
    // Validate required fields for workforce metrics
    if (!body.metric_name || body.metric_value === undefined) {
      return NextResponse.json({ 
        error: 'Metric name and metric value are required' 
      }, { status: 400 });
    }

    // Prepare update data for workforce metrics
    const updateData = {
      metric_name: body.metric_name,
      metric_value: parseFloat(body.metric_value) || 0,
      metric_date: body.metric_date || new Date().toISOString().split('T')[0]
    };

    // First check if the record exists and belongs to the user
    const { data: existingRecord } = await supabase
      .from('workforce_metrics')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Workforce metric not found' }, { status: 404 });
    }

    // Update the workforce record
    const { data: workforce, error } = await supabase
      .from('workforce_metrics')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workforce metric:', error);
      return NextResponse.json({ error: 'Failed to update workforce metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      workforce,
      message: 'Workforce metric updated successfully' 
    });
  } catch (error) {
    console.error('Workforce PUT error:', error);
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
      .from('workforce_metrics')
      .select('id, metric_name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Workforce metric not found' }, { status: 404 });
    }

    // Delete the workforce record
    const { error } = await supabase
      .from('workforce_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting workforce metric:', error);
      return NextResponse.json({ error: 'Failed to delete workforce metric' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Workforce metric "${existingRecord.metric_name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Workforce DELETE error:', error);
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

    const { data: workforce, error } = await supabase
      .from('workforce_metrics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching workforce metric:', error);
      return NextResponse.json({ error: 'Workforce metric not found' }, { status: 404 });
    }

    return NextResponse.json({ workforce });
  } catch (error) {
    console.error('Workforce GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}