import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      seeded_data: {} as Record<string, unknown>
    };

    // Clear existing sample data to prevent duplicates
    console.log('Clearing existing sample data...');
    try {
      await Promise.allSettled([
        supabase.from('inventory_items').delete().eq('user_id', user.id),
        supabase.from('workforce_metrics').delete().eq('user_id', user.id),
        supabase.from('operational_metrics').delete().eq('user_id', user.id),
        supabase.from('financial_insights').delete().eq('user_id', user.id)
      ]);
    } catch (deleteError) {
      console.warn('Error clearing existing data:', deleteError);
    }

    // Seed inventory items (4 sample data)
    const sampleInventoryItems = [
      {
        user_id: user.id,
        item_name: 'Laptop Dell Inspiron',
        sku: 'LAPTOP-DELL-001',
        quantity: 15,
        reorder_level: 5,
        unit_cost: 8500000,
        // Additional fields for extended schema
        current_stock: 15,
        minimum_stock: 5,
        category: 'Electronics',
        supplier: 'PT. Teknologi Indonesia',
        location: 'Gudang A-1-1',
        description: 'Laptop untuk keperluan kantor dan programming'
      },
      {
        user_id: user.id,
        item_name: 'Mouse Wireless Logitech',
        sku: 'MOUSE-LOG-001',
        quantity: 3,
        reorder_level: 10,
        unit_cost: 250000,
        // Additional fields for extended schema
        current_stock: 3,
        minimum_stock: 10,
        category: 'Electronics',
        supplier: 'CV. Aksesori Digital',
        location: 'Gudang B-2-1',
        description: 'Mouse wireless untuk produktivitas kerja'
      },
      {
        user_id: user.id,
        item_name: 'Office Chair Ergonomic',
        sku: 'CHAIR-ERG-001',
        quantity: 12,
        reorder_level: 3,
        unit_cost: 1200000,
        // Additional fields for extended schema
        current_stock: 12,
        minimum_stock: 3,
        category: 'Furniture',
        supplier: 'Furniture Solutions Ltd',
        location: 'Gudang C-1-3',
        description: 'Kursi ergonomis untuk kesehatan postur kerja'
      },
      {
        user_id: user.id,
        item_name: 'Printer HP LaserJet',
        sku: 'PRINTER-HP-001',
        quantity: 2,
        reorder_level: 1,
        unit_cost: 3500000,
        // Additional fields for extended schema
        current_stock: 2,
        minimum_stock: 1,
        category: 'Electronics',
        supplier: 'HP Indonesia',
        location: 'Gudang A-2-1',
        description: 'Printer laser untuk keperluan dokumen bisnis'
      }
    ];

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_items')
      .insert(sampleInventoryItems)
      .select();

    results.seeded_data.inventory_items = {
      success: !inventoryError,
      error: inventoryError?.message,
      count: inventoryData?.length || 0,
      items: inventoryData
    };

    // Seed workforce metrics (3 sample data)
    const sampleWorkforceMetrics = [
      {
        user_id: user.id,
        metric_name: 'Employee Satisfaction Score',
        metric_value: 8.5,
        metric_date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: user.id,
        metric_name: 'Average Productivity Index',
        metric_value: 92.3,
        metric_date: new Date().toISOString().split('T')[0]
      },
      {
        user_id: user.id,
        metric_name: 'Team Collaboration Score',
        metric_value: 7.9,
        metric_date: new Date().toISOString().split('T')[0]
      }
    ];

    const { data: workforceData, error: workforceError } = await supabase
      .from('workforce_metrics')
      .insert(sampleWorkforceMetrics)
      .select();

    results.seeded_data.workforce_metrics = {
      success: !workforceError,
      error: workforceError?.message,
      count: workforceData?.length || 0,
      items: workforceData
    };

    // Seed operational metrics (4 sample data)
    const sampleOperationalMetrics = [
      {
        user_id: user.id,
        department: 'Production',
        process_name: 'Manufacturing Assembly',
        efficiency_rate: 85.5,
        cycle_time: 45.0,
        error_rate: 2.3,
        throughput: 120,
        capacity_utilization: 78.0,
        quality_score: 92.0,
        bottleneck_areas: 'Quality control checkpoint',
        improvement_suggestions: 'Add additional quality control staff and upgrade testing equipment',
        automation_level: 'Medium',
        cost_per_unit: 15000
      },
      {
        user_id: user.id,
        department: 'Marketing',
        process_name: 'Digital Campaign Management',
        efficiency_rate: 75.0,
        cycle_time: 30.0,
        error_rate: 5.2,
        throughput: 50,
        capacity_utilization: 65.0,
        quality_score: 88.0,
        bottleneck_areas: 'Content approval process',
        improvement_suggestions: 'Implement automated approval workflow and content templates',
        automation_level: 'Low',
        cost_per_unit: 8500
      },
      {
        user_id: user.id,
        department: 'Customer Service',
        process_name: 'Ticket Resolution',
        efficiency_rate: 90.0,
        cycle_time: 25.0,
        error_rate: 1.8,
        throughput: 200,
        capacity_utilization: 82.0,
        quality_score: 95.0,
        bottleneck_areas: 'Complex technical issues escalation',
        improvement_suggestions: 'Enhanced training for technical support and knowledge base expansion',
        automation_level: 'High',
        cost_per_unit: 5000
      },
      {
        user_id: user.id,
        department: 'Finance',
        process_name: 'Invoice Processing',
        efficiency_rate: 95.0,
        cycle_time: 15.0,
        error_rate: 0.5,
        throughput: 300,
        capacity_utilization: 88.0,
        quality_score: 98.0,
        bottleneck_areas: 'Manual verification of large invoices',
        improvement_suggestions: 'Implement automated invoice verification for amounts below threshold',
        automation_level: 'High',
        cost_per_unit: 2500
      }
    ];

    const { data: operationalData, error: operationalError } = await supabase
      .from('operational_metrics')
      .insert(sampleOperationalMetrics)
      .select();

    results.seeded_data.operational_metrics = {
      success: !operationalError,
      error: operationalError?.message,
      count: operationalData?.length || 0,
      items: operationalData
    };

    // Seed financial insights (3 sample data)
    const sampleFinancialInsights = [
      {
        user_id: user.id,
        revenue: 125000000,
        expenses: 95000000,
        assets: 250000000,
        liabilities: 75000000,
        market_trends: 'Positive growth trend in Q4 2024 with 15% increase in digital sales',
        business_goals: 'Target 20% revenue growth and expand to 2 new cities by end of 2025',
        cash_flow_analysis: 'Strong positive cash flow with healthy operating margins',
        profitability_analysis: 'Gross profit margin at 24%, net profit margin at 12%',
        investment_opportunities: 'Consider investing in automation and digital marketing expansion',
        recommendations: 'Focus on cost optimization in operations and expand high-margin services'
      },
      {
        user_id: user.id,
        revenue: 118000000,
        expenses: 92000000,
        assets: 245000000,
        liabilities: 78000000,
        market_trends: 'Seasonal increase in demand during holiday periods',
        business_goals: 'Improve operational efficiency and reduce cost per unit by 10%',
        cash_flow_analysis: 'Good cash flow management with adequate reserves',
        profitability_analysis: 'Operating profit margin maintained at 22%',
        investment_opportunities: 'Technology upgrades for production line efficiency',
        recommendations: 'Implement lean manufacturing principles and staff training programs'
      },
      {
        user_id: user.id,
        revenue: 135000000,
        expenses: 98000000,
        assets: 260000000,
        liabilities: 72000000,
        market_trends: 'Market expansion opportunities in neighboring regions',
        business_goals: 'Establish strong market presence and build brand recognition',
        cash_flow_analysis: 'Excellent cash flow with strong working capital position',
        profitability_analysis: 'Record high profit margins achieved through operational excellence',
        investment_opportunities: 'Market expansion and strategic partnerships',
        recommendations: 'Maintain quality standards while scaling operations and invest in brand building'
      }
    ];

    const { data: financialData, error: financialError } = await supabase
      .from('financial_insights')
      .insert(sampleFinancialInsights)
      .select();

    results.seeded_data.financial_insights = {
      success: !financialError,
      error: financialError?.message,
      count: financialData?.length || 0,
      items: financialData
    };

    // Create some inventory transactions if we have inventory items
    if (inventoryData && inventoryData.length > 0) {
      const sampleTransactions = [
        {
          inventory_item_id: inventoryData[0].id,
          transaction_type: 'out' as const,
          quantity: 2,
          remarks: 'Distributed to Marketing Department'
        },
        {
          inventory_item_id: inventoryData[1].id,
          transaction_type: 'in' as const,
          quantity: 20,
          remarks: 'Bulk purchase - Q1 2024'
        },
        {
          inventory_item_id: inventoryData[2].id,
          transaction_type: 'out' as const,
          quantity: 1,
          remarks: 'New employee onboarding'
        },
        {
          inventory_item_id: inventoryData[0].id,
          transaction_type: 'out' as const,
          quantity: 1,
          remarks: 'Replacement for damaged unit'
        }
      ];

      const { data: transactionData, error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert(sampleTransactions)
        .select();

      results.seeded_data.inventory_transactions = {
        success: !transactionError,
        error: transactionError?.message,
        count: transactionData?.length || 0,
        items: transactionData
      };
    }

    // Create sample AI decisions for demonstration
    const sampleDecisions = [
      {
        user_id: user.id,
        decision_type: 'inventory',
        input_data: {
          analysis_type: 'inventory_optimization',
          data_points: inventoryData?.length || 0
        },
        ai_recommendation: 'Critical Inventory Restock: Mouse Wireless Logitech is below minimum stock (3 units vs 10 minimum). Implement automated reorder system to prevent stockouts and maintain operational efficiency.',
        impact_prediction: {
          cost_savings: 750000,
          efficiency_improvement: 92,
          implementation_steps: [
            'Set up automated reorder alerts for low stock items',
            'Contact Logitech supplier for immediate restocking',
            'Implement safety stock buffers for critical items',
            'Review and optimize minimum stock levels'
          ]
        },
        status: 'pending'
      },
      {
        user_id: user.id,
        decision_type: 'operational',
        input_data: {
          analysis_type: 'process_optimization',
          efficiency_metrics: operationalData?.length || 0
        },
        ai_recommendation: 'Process Optimization: Manufacturing Assembly process shows 85.5% efficiency with bottlenecks in quality control. Implementing lean manufacturing principles can increase throughput by 15%.',
        impact_prediction: {
          cost_savings: 1250000,
          efficiency_improvement: 88,
          implementation_steps: [
            'Map current manufacturing workflow',
            'Identify quality control bottlenecks',
            'Train staff on lean manufacturing principles',
            'Implement continuous improvement processes'
          ]
        },
        status: 'approved'
      },
      {
        user_id: user.id,
        decision_type: 'workforce',
        input_data: {
          analysis_type: 'hr_optimization',
          workforce_size: workforceData?.length || 0
        },
        ai_recommendation: 'Workforce Enhancement: Employee satisfaction score at 8.5/10 is good, but productivity can be improved through targeted training programs and performance incentives.',
        impact_prediction: {
          cost_savings: 950000,
          efficiency_improvement: 83,
          implementation_steps: [
            'Conduct detailed performance analysis',
            'Develop personalized training programs',
            'Implement performance-based incentives',
            'Set up regular feedback sessions'
          ]
        },
        status: 'pending'
      },
      {
        user_id: user.id,
        decision_type: 'financial',
        input_data: {
          analysis_type: 'cost_optimization',
          revenue_data: financialData?.length || 0
        },
        ai_recommendation: 'Cost Structure Optimization: Analysis reveals 12% potential savings through strategic vendor negotiations and operational efficiency improvements. Focus on high-impact, low-risk optimizations.',
        impact_prediction: {
          cost_savings: 2150000,
          efficiency_improvement: 79,
          implementation_steps: [
            'Audit current cost structure by category',
            'Negotiate better terms with key suppliers',
            'Optimize operational processes to reduce waste',
            'Implement cost monitoring and control systems'
          ]
        },
        status: 'pending'
      }
    ];

    const { data: decisionsData, error: decisionsError } = await supabase
      .from('orchestration_decisions')
      .insert(sampleDecisions)
      .select();

    results.seeded_data.sample_decisions = {
      success: !decisionsError,
      error: decisionsError?.message,
      count: decisionsData?.length || 0,
      items: decisionsData
    };

    // Create a sample orchestration decision
    const sampleDecision = {
      user_id: user.id,
      decision_type: 'inventory_reorder',
      input_data: {
        trigger: 'low_stock_alert',
        affected_items: ['MOUSE-LOG-001'],
        current_levels: { 'MOUSE-LOG-001': 3 },
        reorder_levels: { 'MOUSE-LOG-001': 10 }
      },
      ai_recommendation: 'Urgent reorder needed for Mouse Wireless Logitech. Current stock (3 units) is below reorder level (10 units). Recommend ordering 25 units to meet projected demand and maintain safety stock.',
      impact_prediction: {
        cost_impact: 6250000,
        stock_coverage_days: 45,
        risk_level: 'medium'
      },
      status: 'pending' as const
    };

    const { data: decisionData, error: decisionError } = await supabase
      .from('orchestration_decisions')
      .insert(sampleDecision)
      .select();

    results.seeded_data.orchestration_decisions = {
      success: !decisionError,
      error: decisionError?.message,
      count: decisionData?.length || 0,
      items: decisionData
    };

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully for Resource Optimization Hub',
      results
    });

  } catch (error) {
    console.error('Seed endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Seeding failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}