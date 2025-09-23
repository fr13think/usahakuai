import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: inventory, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Inventory GET error:', error);
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
    if (!body.item_name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    // Prepare inventory data (matching actual database schema)
    const inventoryData = {
      user_id: user.id,
      item_name: body.item_name,
      sku: body.sku || null, // sku can be nullable
      quantity: parseInt(body.quantity) || 0,
      reorder_level: parseInt(body.reorder_level) || 0,
      unit_cost: parseFloat(body.unit_cost) || 0,
      // Additional columns from update schema
      current_stock: parseInt(body.current_stock || body.quantity) || 0,
      minimum_stock: parseInt(body.minimum_stock || body.reorder_level) || 0,
      category: body.category || null,
      supplier: body.supplier || null,
      location: body.location || null,
      description: body.description || null,
      last_restocked: body.last_restocked || null
    };

    const { data: inventory, error } = await supabase
      .from('inventory_items')
      .insert([inventoryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      inventory,
      message: 'Inventory item created successfully' 
    });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}