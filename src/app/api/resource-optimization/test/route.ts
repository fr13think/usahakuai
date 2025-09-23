import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test database connectivity and table structure
    const testResults = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      tables_tested: {}
    };

    try {
      // Test inventory_items table
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      testResults.tables_tested = {
        ...testResults.tables_tested,
        inventory_items: {
          accessible: !inventoryError,
          error: inventoryError?.message,
          count: inventory?.length || 0
        }
      };
    } catch (error) {
      testResults.tables_tested = {
        ...testResults.tables_tested,
        inventory_items: {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }

    try {
      // Test inventory_transactions table
      const { data: transactions, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select('*', { count: 'exact' })
        .limit(10);

      testResults.tables_tested = {
        ...testResults.tables_tested,
        inventory_transactions: {
          accessible: !transactionsError,
          error: transactionsError?.message,
          count: transactions?.length || 0
        }
      };
    } catch (error) {
      testResults.tables_tested = {
        ...testResults.tables_tested,
        inventory_transactions: {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }

    try {
      // Test workforce_metrics table
      const { data: workforce, error: workforceError } = await supabase
        .from('workforce_metrics')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      testResults.tables_tested = {
        ...testResults.tables_tested,
        workforce_metrics: {
          accessible: !workforceError,
          error: workforceError?.message,
          count: workforce?.length || 0
        }
      };
    } catch (error) {
      testResults.tables_tested = {
        ...testResults.tables_tested,
        workforce_metrics: {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }

    try {
      // Test orchestration_decisions table
      const { data: decisions, error: decisionsError } = await supabase
        .from('orchestration_decisions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      testResults.tables_tested = {
        ...testResults.tables_tested,
        orchestration_decisions: {
          accessible: !decisionsError,
          error: decisionsError?.message,
          count: decisions?.length || 0
        }
      };
    } catch (error) {
      testResults.tables_tested = {
        ...testResults.tables_tested,
        orchestration_decisions: {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Resource Optimization Hub database connectivity test',
      results: testResults
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}