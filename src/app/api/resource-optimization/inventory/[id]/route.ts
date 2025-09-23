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
    if (!body.item_name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    // Prepare update data (only fields that exist in the table)
    const updateData = {
      item_name: body.item_name,
      sku: body.sku || null, // sku can be nullable
      quantity: parseInt(body.quantity) || 0,
      reorder_level: parseInt(body.reorder_level) || 0,
      unit_cost: parseFloat(body.unit_cost) || 0,
      // Sync with additional schema columns
      current_stock: parseInt(body.current_stock || body.quantity) || 0,
      minimum_stock: parseInt(body.minimum_stock || body.reorder_level) || 0,
      category: body.category || null,
      supplier: body.supplier || null,
      location: body.location || null,
      description: body.description || null,
      last_restocked: body.last_restocked || null,
      updated_at: new Date().toISOString()
    };

    // First check if the item exists and belongs to the user
    const { data: existingItem } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Update the inventory item
    const { data: inventory, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      inventory,
      message: 'Inventory item updated successfully' 
    });
  } catch (error) {
    console.error('Inventory PUT error:', error);
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

    // First check if the item exists and belongs to the user
    const { data: existingItem } = await supabase
      .from('inventory_items')
      .select('id, item_name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Check if there are any related inventory transactions
    const { data: transactions } = await supabase
      .from('inventory_transactions')
      .select('id')
      .eq('inventory_item_id', id)
      .limit(1);

    if (transactions && transactions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete inventory item with existing transactions. Please remove transactions first.' 
      }, { status: 400 });
    }

    // Delete the inventory item
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Inventory item "${existingItem.item_name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
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

    const { data: inventory, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching inventory item:', error);
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}