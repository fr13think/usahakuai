import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Auto-implementation confidence threshold (from environment or default)
const AUTO_IMPLEMENT_THRESHOLD = parseInt(process.env.AUTO_IMPLEMENT_CONFIDENCE_THRESHOLD || '85');


interface ResourceData {
  inventory: Array<{
    id?: string;
    current_stock: number;
    minimum_stock: number;
    unit_cost: number;
    item_name: string;
  }>;
  workforce: Array<{
    id?: string;
    metric_name: string;
    metric_value: number;
    metric_date: string;
  }>;
  operations: Array<{
    id?: string;
    metric_name: string;
    metric_value: number;
    metric_date: string;
  }>;
  cashflow: Array<{
    id?: string;
    revenue?: number | null;
    expenses?: number | null;
    cash_flow_analysis?: string | null;
  }>;
}

interface AnalysisResult {
  overall_health_score?: number;
  critical_issues?: Array<{
    type: string;
    severity: string;
    description: string;
    immediate_action: string;
  }>;
  optimization_recommendations?: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    expected_savings: number;
    implementation_steps: string[];
    confidence_score: number;
    auto_implementable: boolean;
  }>;
  financial_impact?: {
    potential_cost_savings?: number;
    cash_flow_improvement?: number;
    roi_percentage?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, trigger_type, force_run } = await request.json();

    if (action === 'run_automation') {
      return await runAutomationEngine(user.id, trigger_type, force_run, supabase);
    } else if (action === 'configure_automation') {
      return await configureAutomation(user.id, await request.json());
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json(
      { error: 'Failed to process automation request' },
      { status: 500 }
    );
  }
}

async function runAutomationEngine(userId: string, triggerType: string = 'scheduled', forceRun: boolean = false, supabase: SupabaseClient<Database>) {
  try {
    console.log('🤖 Running Resource Optimization Automation Engine...');
    
    // Get current resource data
    const [inventory, workforce, operations, cashflow] = await Promise.all([
      supabase.from('inventory_items').select('*').eq('user_id', userId),
      supabase.from('workforce_metrics').select('*').eq('user_id', userId),
      supabase.from('workforce_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false }).limit(7),
      supabase.from('financial_insights').select('*').eq('user_id', userId).limit(30)
    ]);

    const resourceData = {
      inventory: inventory.data || [],
      workforce: workforce.data || [],
      operations: operations.data || [],
      cashflow: cashflow.data || []
    };

    // Check automation triggers
    const triggers = await checkAutomationTriggers(resourceData, triggerType);
    
    if (!triggers.shouldRun && !forceRun) {
      return NextResponse.json({
        success: true,
        message: 'No automation triggers activated',
        triggers_checked: triggers.checkedTriggers,
        next_run: 'Next scheduled run in 1 hour'
      });
    }

    console.log('🚨 Automation triggers activated:', triggers.activatedTriggers);

    // Run AI analysis for current situation
    const analysis = await performAutomatedAnalysis(resourceData, triggers.activatedTriggers);
    
    // Process auto-implementable decisions
    const implementationResults = await processAutoImplementations(userId, analysis, supabase);
    
    // Generate notifications for manual decisions
    const notifications = await generateActionNotifications(userId, analysis);

    console.log('✅ Automation engine completed successfully');

    return NextResponse.json({
      success: true,
      automation_run: {
        trigger_type: triggerType,
        triggers_activated: triggers.activatedTriggers,
        analysis_generated: !!analysis,
        auto_implementations: implementationResults.implemented,
        manual_notifications: notifications.sent,
        total_decisions: analysis?.optimization_recommendations?.length || 0,
        run_timestamp: new Date().toISOString()
      },
      summary: {
        critical_issues: analysis?.critical_issues?.length || 0,
        high_priority_actions: analysis?.optimization_recommendations?.filter((r) => r.priority === 'high').length || 0,
        potential_savings: analysis?.financial_impact?.potential_cost_savings || 0
      }
    });

  } catch (error) {
    console.error('Automation engine error:', error);
    return NextResponse.json({
      success: false,
      error: 'Automation engine failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function checkAutomationTriggers(resourceData: ResourceData, triggerType: string) {
  const triggers = {
    shouldRun: false,
    activatedTriggers: [] as string[],
    checkedTriggers: [] as string[]
  };

  // Critical stock levels
  const lowStockItems = resourceData.inventory.filter((item) => 
    item.current_stock <= item.minimum_stock
  );
  triggers.checkedTriggers.push('low_stock_check');
  if (lowStockItems.length > 0) {
    triggers.shouldRun = true;
    triggers.activatedTriggers.push(`low_stock_alert_${lowStockItems.length}_items`);
  }

  // Performance threshold based on workforce metrics
  const recentWorkforce = resourceData.workforce.slice(0, 7);
  const avgPerformance = recentWorkforce.length > 0 ? 
    recentWorkforce.reduce((sum: number, metric) => sum + metric.metric_value, 0) / recentWorkforce.length : 100;
  const performanceThreshold = parseInt(process.env.PERFORMANCE_WARNING_THRESHOLD || '70');
  triggers.checkedTriggers.push('performance_check');
  if (avgPerformance < performanceThreshold) {
    triggers.shouldRun = true;
    triggers.activatedTriggers.push(`low_performance_${avgPerformance.toFixed(1)}%`);
  }

  // Cash flow concerns based on financial insights
  const recentFinancials = resourceData.cashflow.slice(0, 5); // Last 5 entries
  const totalRevenue = recentFinancials.reduce((sum: number, insight) => sum + (insight.revenue || 0), 0);
  const totalExpenses = recentFinancials.reduce((sum: number, insight) => sum + (insight.expenses || 0), 0);

  triggers.checkedTriggers.push('cash_flow_check');
  if (totalExpenses > totalRevenue * 1.2 && totalRevenue > 0) { // Expenses > 120% of revenue
    triggers.shouldRun = true;
    triggers.activatedTriggers.push('negative_cash_flow_trend');
  }

  // Operational efficiency drop based on operations metrics
  const recentOperations = resourceData.operations.slice(0, 7);
  if (recentOperations.length > 0) {
    const avgEfficiency = recentOperations.reduce((sum: number, op) => 
      sum + op.metric_value, 0
    ) / recentOperations.length;
    
    triggers.checkedTriggers.push('efficiency_check');
    if (avgEfficiency < 70) { // Below 70% efficiency
      triggers.shouldRun = true;
      triggers.activatedTriggers.push(`low_efficiency_${avgEfficiency.toFixed(1)}%`);
    }
  }

  // Force run on manual trigger
  if (triggerType === 'manual') {
    triggers.shouldRun = true;
    triggers.activatedTriggers.push('manual_trigger');
  }

  return triggers;
}

async function performAutomatedAnalysis(resourceData: ResourceData, triggers: string[]): Promise<AnalysisResult | null> {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const contextData = {
      triggered_alerts: triggers,
      inventory_summary: {
        total_items: resourceData.inventory.length,
        low_stock_items: resourceData.inventory.filter((item) => item.current_stock <= item.minimum_stock).length,
        critical_stock_value: resourceData.inventory
          .filter((item) => item.current_stock <= item.minimum_stock)
          .reduce((sum: number, item) => sum + (item.current_stock * item.unit_cost), 0)
      },
      workforce_summary: {
        total_metrics: resourceData.workforce.length,
        avg_performance: resourceData.workforce.length > 0 ? 
          resourceData.workforce.reduce((sum: number, metric) => sum + metric.metric_value, 0) / resourceData.workforce.length : 0,
        performance_trend: 'stable'
      },
      operations_summary: {
        recent_metrics: resourceData.operations.slice(0, 3),
        avg_efficiency: resourceData.operations.length > 0 ? 
          resourceData.operations.reduce((sum: number, op) => sum + op.metric_value, 0) / resourceData.operations.length : 0,
        metric_count: resourceData.operations.length
      },
      financial_summary: {
        total_revenue: resourceData.cashflow.reduce((sum: number, insight) => sum + (insight.revenue || 0), 0),
        total_expenses: resourceData.cashflow.reduce((sum: number, insight) => sum + (insight.expenses || 0), 0),
        insights_count: resourceData.cashflow.length
      }
    };

    const aiPrompt = `AUTOMATION MODE: Analisis cepat untuk sistem otomasi Resource Optimization Hub UKM Indonesia.

TRIGGER ALERTS: ${triggers.join(', ')}

DATA SNAPSHOT:
${JSON.stringify(contextData, null, 2)}

Sebagai AI Automation Expert, berikan analisis CEPAT dan FOKUS untuk situasi yang memerlukan tindakan segera. 

Response format JSON:
{
  "overall_health_score": 75,
  "critical_issues": [
    {
      "type": "inventory_shortage",
      "severity": "critical",
      "description": "3 items kritis di bawah minimum stock",
      "immediate_action": "Auto-reorder items: Laptop, Printer, Kertas A4"
    }
  ],
  "optimization_recommendations": [
    {
      "category": "inventory",
      "priority": "critical",
      "title": "Emergency Inventory Reorder",
      "description": "Restock critical items to prevent stockout",
      "expected_savings": 0,
      "implementation_steps": ["Generate PO", "Contact suppliers", "Update stock records"],
      "confidence_score": 95,
      "auto_implementable": true
    }
  ],
  "financial_impact": {
    "potential_cost_savings": 1000000,
    "cash_flow_improvement": 500000,
    "roi_percentage": 15
  },
  "resource_efficiency": {
    "inventory_optimization": 60,
    "workforce_utilization": 75,
    "operational_efficiency": 70
  }
}

PENTING:
- Fokus pada masalah URGENT yang bisa diotomasikan
- Confidence score tinggi untuk auto-implementable items
- Prioritaskan cash flow dan stock critical
- Perhitungan dalam Rupiah Indonesia`;

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: "You are an automation-focused Resource Optimization AI. Provide quick, actionable analysis for urgent business situations. Focus on auto-implementable solutions."
        },
        {
          role: "user",
          content: aiPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for consistent automation
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return JSON.parse(aiResponse);
  } catch (error) {
    console.error('Automated analysis error:', error);
    return null;
  }
}

async function processAutoImplementations(userId: string, analysis: AnalysisResult | null, supabase: SupabaseClient<Database>) {
  const results = {
    implemented: 0,
    failed: 0,
    decisions_created: 0
  };

  if (!analysis?.optimization_recommendations) {
    return results;
  }

  for (const recommendation of analysis.optimization_recommendations) {
    try {
      // Save as orchestration decision first
      const { data: decision } = await supabase.from('orchestration_decisions').insert({
        user_id: userId,
        decision_type: recommendation.category,
        input_data: { 
          automation_trigger: true, 
          timestamp: new Date().toISOString(),
          priority: recommendation.priority,
          confidence_score: recommendation.confidence_score
        },
        ai_recommendation: `AUTOMATED: ${recommendation.title} - ${recommendation.description}`,
        impact_prediction: {
          cost_savings: recommendation.expected_savings,
          confidence: recommendation.confidence_score,
          implementation_steps: recommendation.implementation_steps
        },
        status: recommendation.auto_implementable && recommendation.confidence_score >= AUTO_IMPLEMENT_THRESHOLD ? 'auto_implementing' : 'pending'
      }).select().single();

      results.decisions_created++;

      // Auto-implement high-confidence decisions
      if (recommendation.auto_implementable && recommendation.confidence_score >= AUTO_IMPLEMENT_THRESHOLD && decision) {
        try {
          // Simulate implementation (in real app, this would do actual business logic)
          await supabase
            .from('orchestration_decisions')
            .update({
              status: 'implemented',
              updated_at: new Date().toISOString()
            })
            .eq('id', decision.id);

          // Log implementation
          console.log(`✅ Auto-implemented: ${recommendation.title} (${recommendation.confidence_score}% confidence)`);
          results.implemented++;

          // In real implementation, you would:
          // - Generate purchase orders for inventory
          // - Adjust staff schedules
          // - Update cash flow projections
          // - Send supplier notifications
          
        } catch (implError) {
          console.error('Auto-implementation failed:', implError);
          results.failed++;
        }
      }
    } catch (error) {
      console.error('Decision creation failed:', error);
      results.failed++;
    }
  }

  return results;
}

async function generateActionNotifications(_userId: string, analysis: AnalysisResult | null) {
  const results = {
    sent: 0,
    failed: 0
  };

  if (!analysis?.critical_issues) {
    return results;
  }

  // In a real implementation, this would send actual notifications
  // For now, we'll log them and could integrate with email/SMS services
  
  for (const issue of analysis.critical_issues) {
    try {
      console.log(`🚨 CRITICAL ALERT: ${issue.description} - Action: ${issue.immediate_action}`);
      
      // Here you could integrate with:
      // - Email notifications (Supabase Edge Functions)
      // - SMS notifications (Twilio, etc.)
      // - Slack/Discord webhooks
      // - Push notifications
      
      results.sent++;
    } catch (error) {
      console.error('Notification failed:', error);
      results.failed++;
    }
  }

  return results;
}

async function configureAutomation(_userId: string, config: Record<string, unknown>) {
  try {
    // For now, just log the configuration (in a real app, you'd store this in a settings table)
    console.log(`Automation config updated for user ${_userId}:`, config);
    
    // TODO: Store configuration in database when settings table is available
    // This could be stored in profiles table or a dedicated settings table
    
    return NextResponse.json({
      success: true,
      message: 'Automation settings received and processed',
      settings: config,
      note: 'Settings are processed but not yet persisted to database'
    });
  } catch (error) {
    console.error('Configuration update failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process automation settings'
    }, { status: 500 });
  }
}
