import { z } from 'zod';

// Inventory Item Validation Schema
export const inventoryItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required').max(255, 'Item name too long'),
  sku: z.string().max(100, 'SKU too long').optional().nullable(),
  category: z.string().max(100, 'Category too long').optional().nullable(),
  current_stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minimum_stock: z.number().int().min(0, 'Minimum stock cannot be negative').default(0),
  unit_cost: z.number().min(0, 'Unit cost cannot be negative').default(0),
  supplier: z.string().max(255, 'Supplier name too long').optional().nullable(),
  location: z.string().max(255, 'Location too long').optional().nullable(),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  last_restocked: z.string().optional().nullable(),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

// Workforce Metrics Validation Schema
export const workforceMetricSchema = z.object({
  employee_name: z.string().min(1, 'Employee name is required').max(255, 'Name too long'),
  employee_id: z.string().max(50, 'Employee ID too long').optional().nullable(),
  department: z.string().min(1, 'Department is required').max(100, 'Department name too long'),
  position: z.string().max(100, 'Position too long').optional().nullable(),
  performance_score: z.number().min(0, 'Performance score cannot be negative').max(100, 'Performance score cannot exceed 100').optional().nullable(),
  salary: z.number().min(0, 'Salary cannot be negative').optional().nullable(),
  hire_date: z.string().optional().nullable(),
  skills: z.string().max(1000, 'Skills description too long').optional().nullable(),
  certifications: z.string().max(1000, 'Certifications too long').optional().nullable(),
  training_needs: z.string().max(1000, 'Training needs too long').optional().nullable(),
  goals: z.string().max(1000, 'Goals too long').optional().nullable(),
});

export type WorkforceMetricInput = z.infer<typeof workforceMetricSchema>;

// Operational Metrics Validation Schema
export const operationalMetricSchema = z.object({
  department: z.string().min(1, 'Department is required').max(100, 'Department name too long'),
  process_name: z.string().min(1, 'Process name is required').max(255, 'Process name too long'),
  efficiency_rate: z.number().min(0, 'Efficiency rate cannot be negative').max(100, 'Efficiency rate cannot exceed 100').default(0),
  cycle_time: z.number().min(0, 'Cycle time cannot be negative').default(0),
  error_rate: z.number().min(0, 'Error rate cannot be negative').max(100, 'Error rate cannot exceed 100').default(0),
  throughput: z.number().int().min(0, 'Throughput cannot be negative').default(0),
  capacity_utilization: z.number().min(0, 'Capacity utilization cannot be negative').max(100, 'Capacity utilization cannot exceed 100').default(0),
  quality_score: z.number().min(0, 'Quality score cannot be negative').max(100, 'Quality score cannot exceed 100').optional().nullable(),
  bottleneck_areas: z.string().max(1000, 'Bottleneck areas description too long').optional().nullable(),
  improvement_suggestions: z.string().max(1000, 'Improvement suggestions too long').optional().nullable(),
  automation_level: z.enum(['Low', 'Medium', 'High', 'Fully Automated']).default('Low'),
  cost_per_unit: z.number().min(0, 'Cost per unit cannot be negative').optional().nullable(),
});

export type OperationalMetricInput = z.infer<typeof operationalMetricSchema>;

// Financial Insights Validation Schema
export const financialInsightSchema = z.object({
  revenue: z.number().min(0, 'Revenue cannot be negative'),
  expenses: z.number().min(0, 'Expenses cannot be negative'),
  assets: z.number().min(0, 'Assets cannot be negative').optional().nullable(),
  liabilities: z.number().min(0, 'Liabilities cannot be negative').optional().nullable(),
  market_trends: z.string().max(2000, 'Market trends description too long').optional().nullable(),
  business_goals: z.string().max(2000, 'Business goals too long').optional().nullable(),
  cash_flow_analysis: z.string().max(2000, 'Cash flow analysis too long').optional().nullable(),
  profitability_analysis: z.string().max(2000, 'Profitability analysis too long').optional().nullable(),
  investment_opportunities: z.string().max(2000, 'Investment opportunities too long').optional().nullable(),
  recommendations: z.string().max(2000, 'Recommendations too long').optional().nullable(),
});

export type FinancialInsightInput = z.infer<typeof financialInsightSchema>;

// Utility function to validate and format data
export function validateResourceOptimizationData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Business logic validations
export function validateInventoryBusinessRules(data: InventoryItemInput): string[] {
  const warnings: string[] = [];
  
  if (data.current_stock <= data.minimum_stock && data.minimum_stock > 0) {
    warnings.push('Current stock is at or below minimum stock level');
  }
  
  if (data.unit_cost === 0) {
    warnings.push('Unit cost is zero - consider updating with actual cost');
  }
  
  if (data.current_stock > data.minimum_stock * 10 && data.minimum_stock > 0) {
    warnings.push('Current stock is very high compared to minimum stock - possible overstock');
  }
  
  return warnings;
}

export function validateWorkforceBusinessRules(data: WorkforceMetricInput): string[] {
  const warnings: string[] = [];
  
  if (data.performance_score && data.performance_score < 60) {
    warnings.push('Performance score is below average - may need attention');
  }
  
  if (data.performance_score && data.performance_score > 95) {
    warnings.push('Exceptional performance score - consider for recognition');
  }
  
  if (data.hire_date) {
    const hireDate = new Date(data.hire_date);
    const now = new Date();
    const monthsWorked = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsWorked < 3) {
      warnings.push('New employee - consider probation period guidelines');
    }
  }
  
  return warnings;
}

export function validateOperationalBusinessRules(data: OperationalMetricInput): string[] {
  const warnings: string[] = [];
  
  if (data.efficiency_rate < 60) {
    warnings.push('Low efficiency rate - immediate improvement needed');
  }
  
  if (data.error_rate > 5) {
    warnings.push('High error rate - quality control review recommended');
  }
  
  if (data.capacity_utilization < 50) {
    warnings.push('Low capacity utilization - resources may be underutilized');
  }
  
  if (data.capacity_utilization > 95) {
    warnings.push('Very high capacity utilization - risk of bottlenecks');
  }
  
  const overallEfficiency = (data.efficiency_rate + data.capacity_utilization + (100 - data.error_rate)) / 3;
  if (overallEfficiency < 60) {
    warnings.push('Overall operational performance is below standard');
  }
  
  return warnings;
}

export function validateFinancialBusinessRules(data: FinancialInsightInput): string[] {
  const warnings: string[] = [];
  
  const netProfit = data.revenue - data.expenses;
  const profitMargin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;
  
  if (netProfit < 0) {
    warnings.push('Business is operating at a loss');
  }
  
  if (profitMargin < 5 && profitMargin >= 0) {
    warnings.push('Low profit margin - consider cost optimization');
  }
  
  if (data.assets && data.liabilities) {
    const debtToAssetRatio = data.liabilities / data.assets;
    if (debtToAssetRatio > 0.6) {
      warnings.push('High debt-to-asset ratio - financial risk concern');
    }
  }
  
  if (data.expenses > data.revenue * 1.2) {
    warnings.push('Expenses significantly exceed revenue - urgent cost review needed');
  }
  
  return warnings;
}