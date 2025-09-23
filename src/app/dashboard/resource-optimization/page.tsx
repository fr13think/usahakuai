"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import InventoryForm from '@/components/resource-optimization/InventoryForm';
import WorkforceForm from '@/components/resource-optimization/WorkforceForm';
import OperationalForm from '@/components/resource-optimization/OperationalForm';
import FinancialForm from '@/components/resource-optimization/FinancialForm';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Users,
  Zap,
  TrendingUp,
  RefreshCw,
  Play,
  X,
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

interface InventoryItem {
  id: string;
  item_name: string;
  sku?: string | null;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  created_at?: string;
  updated_at?: string;
}

interface WorkforceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  created_at?: string;
}

interface OperationalMetric {
  id: string;
  department: string;
  process_name: string;
  efficiency_rate: number;
  cycle_time: number;
  error_rate: number;
  throughput: number;
  capacity_utilization: number;
  quality_score?: number;
  bottleneck_areas?: string;
  improvement_suggestions?: string;
  automation_level?: string;
  cost_per_unit?: number;
}

interface FinancialInsight {
  id: string;
  revenue: number;
  expenses: number;
  assets?: number;
  liabilities?: number;
  market_trends?: string;
  business_goals?: string;
  cash_flow_analysis?: string;
  profitability_analysis?: string;
  investment_opportunities?: string;
  recommendations?: string;
}

interface ResourceData {
  inventory: InventoryItem[];
  workforce: WorkforceMetric[];
  operations: OperationalMetric[];
  financials: FinancialInsight[];
  decisions: Array<{
    id: string;
    decision_type: string;
    ai_recommendation: string;
    impact_prediction?: {
      cost_savings?: number;
      efficiency_improvement?: number;
      implementation_steps?: string[];
    };
    status: string;
    created_at: string;
    user_id: string;
    input_data?: Record<string, unknown>;
  }>;
  settings: unknown;
}

interface OptimizationAnalysis {
  overall_health_score: number;
  critical_issues: Array<{
    type: string;
    severity: string;
    description: string;
    immediate_action: string;
  }>;
  optimization_recommendations: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
    expected_savings: number;
    implementation_steps: string[];
    confidence_score: number;
    auto_implementable: boolean;
  }>;
  financial_impact: {
    potential_cost_savings: number;
    cash_flow_improvement: number;
    roi_percentage: number;
  };
  resource_efficiency: {
    inventory_optimization: number;
    workforce_utilization: number;
    operational_efficiency: number;
  };
}

export default function ResourceOptimizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resourceData, setResourceData] = useState<ResourceData | null>(null);
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');
  
  // Form dialog states
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showWorkforceForm, setShowWorkforceForm] = useState(false);
  const [showOperationalForm, setShowOperationalForm] = useState(false);
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  
  // Edit states
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [editingWorkforce, setEditingWorkforce] = useState<WorkforceMetric | null>(null);
  const [editingOperational, setEditingOperational] = useState<OperationalMetric | null>(null);
  const [editingFinancial, setEditingFinancial] = useState<FinancialInsight | null>(null);
  
  const [formLoading, setFormLoading] = useState(false);

  // Load resource data
  const loadResourceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resource-optimization');
      if (!response.ok) throw new Error('Failed to fetch resource data');
      
      const data = await response.json();
      setResourceData(data);
    } catch (error) {
      console.error('Error loading resource data:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Data',
        description: 'Tidak dapat memuat data resource optimization.'
      });
    }
    setIsLoading(false);
  }, [toast]);

  // CRUD Operations for Inventory
  const handleInventorySubmit = async (inventory: Partial<InventoryItem>) => {
    setFormLoading(true);
    try {
      const method = inventory.id ? 'PUT' : 'POST';
      const endpoint = inventory.id 
        ? `/api/resource-optimization/inventory/${inventory.id}` 
        : '/api/resource-optimization/inventory';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory)
      });
      
      if (!response.ok) throw new Error('Failed to save inventory');
      
      await loadResourceData();
      setShowInventoryForm(false);
      setEditingInventory(null);
    } catch (error) {
      console.error('Error saving inventory:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/resource-optimization/inventory/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete inventory');
      
      toast({
        title: 'Item Deleted',
        description: 'Inventory item berhasil dihapus.'
      });
      
      await loadResourceData();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Gagal menghapus inventory item.'
      });
    }
  };

  // CRUD Operations for Workforce
  const handleWorkforceSubmit = async (workforce: Partial<WorkforceMetric>) => {
    setFormLoading(true);
    try {
      const method = workforce.id ? 'PUT' : 'POST';
      const endpoint = workforce.id 
        ? `/api/resource-optimization/workforce/${workforce.id}` 
        : '/api/resource-optimization/workforce';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workforce)
      });
      
      if (!response.ok) throw new Error('Failed to save workforce');
      
      await loadResourceData();
      setShowWorkforceForm(false);
      setEditingWorkforce(null);
    } catch (error) {
      console.error('Error saving workforce:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteWorkforceItem = async (id: string) => {
    try {
      const response = await fetch(`/api/resource-optimization/workforce/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete workforce');
      
      toast({
        title: 'Employee Deleted',
        description: 'Employee data berhasil dihapus.'
      });
      
      await loadResourceData();
    } catch (error) {
      console.error('Error deleting workforce:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Gagal menghapus employee data.'
      });
    }
  };

  // CRUD Operations for Operational Metrics
  const handleOperationalSubmit = async (metric: Partial<OperationalMetric>) => {
    setFormLoading(true);
    try {
      const method = metric.id ? 'PUT' : 'POST';
      const endpoint = metric.id 
        ? `/api/resource-optimization/operational/${metric.id}` 
        : '/api/resource-optimization/operational';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
      
      if (!response.ok) throw new Error('Failed to save operational metric');
      
      await loadResourceData();
      setShowOperationalForm(false);
      setEditingOperational(null);
    } catch (error) {
      console.error('Error saving operational metric:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteOperationalMetric = async (id: string) => {
    try {
      const response = await fetch(`/api/resource-optimization/operational/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete operational metric');
      
      toast({
        title: 'Metric Deleted',
        description: 'Operational metric berhasil dihapus.'
      });
      
      await loadResourceData();
    } catch (error) {
      console.error('Error deleting operational metric:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Gagal menghapus operational metric.'
      });
    }
  };

  // CRUD Operations for Financial Data
  const handleFinancialSubmit = async (financial: Partial<FinancialInsight>) => {
    setFormLoading(true);
    try {
      const method = financial.id ? 'PUT' : 'POST';
      const endpoint = financial.id 
        ? `/api/resource-optimization/financial/${financial.id}` 
        : '/api/resource-optimization/financial';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financial)
      });
      
      if (!response.ok) throw new Error('Failed to save financial data');
      
      await loadResourceData();
      setShowFinancialForm(false);
      setEditingFinancial(null);
    } catch (error) {
      console.error('Error saving financial data:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteFinancialData = async (id: string) => {
    try {
      const response = await fetch(`/api/resource-optimization/financial/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete financial data');
      
      toast({
        title: 'Financial Data Deleted',
        description: 'Financial data berhasil dihapus.'
      });
      
      await loadResourceData();
    } catch (error) {
      console.error('Error deleting financial data:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Gagal menghapus financial data.'
      });
    }
  };

  // Helper functions for opening edit forms
  const editInventory = (item: InventoryItem) => {
    setEditingInventory(item);
    setShowInventoryForm(true);
  };

  const editWorkforce = (item: WorkforceMetric) => {
    setEditingWorkforce(item);
    setShowWorkforceForm(true);
  };

  const editOperational = (item: OperationalMetric) => {
    setEditingOperational(item);
    setShowOperationalForm(true);
  };

  const editFinancial = (item: FinancialInsight) => {
    setEditingFinancial(item);
    setShowFinancialForm(true);
  };

  // Perform AI analysis
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/resource-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyze',
          data: resourceData 
        })
      });

      if (!response.ok) throw new Error('Failed to perform analysis');
      
      const result = await response.json();
      setAnalysis(result.analysis);

      toast({
        title: 'Analisis Selesai!',
        description: 'AI telah menganalisis resource Anda dan memberikan rekomendasi optimasi.'
      });

      // Reload decisions
      await loadResourceData();
    } catch (error) {
      console.error('Error performing analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Analisis Gagal',
        description: 'Terjadi kesalahan saat melakukan analisis AI.'
      });
    }
    setIsAnalyzing(false);
  };

  // Implement optimization decision
  const implementDecision = async (decisionId: string) => {
    try {
      const response = await fetch('/api/resource-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'implement',
          decisionId
        })
      });

      if (!response.ok) throw new Error('Failed to implement decision');
      
      const result = await response.json();
      
      toast({
        title: 'Implementasi Berhasil!',
        description: result.implementation_result
      });

      // Reload data
      await loadResourceData();
    } catch (error) {
      console.error('Error implementing decision:', error);
      toast({
        variant: 'destructive',
        title: 'Implementasi Gagal',
        description: 'Terjadi kesalahan saat mengimplementasi keputusan.'
      });
    }
  };

  // Update decision status
  const updateDecisionStatus = async (decisionId: string, status: string) => {
    try {
      const response = await fetch('/api/resource-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          decisionId,
          status
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast({
        title: 'Status Diperbarui',
        description: `Status keputusan telah diubah ke ${status}`
      });

      // Reload data
      await loadResourceData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Gagal',
        description: 'Gagal memperbarui status keputusan.'
      });
    }
  };

  // Test database connectivity
  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/resource-optimization/test');
      if (!response.ok) throw new Error('Failed to test connection');
      
      const result = await response.json();
      
      if (result.success) {
        const accessibleTables = Object.entries(result.results.tables_tested)
          .filter(([, table]) => (table as { accessible: boolean }).accessible)
          .length;
        const totalTables = Object.keys(result.results.tables_tested).length;
        
        toast({
          title: 'Test Koneksi Berhasil!',
          description: `${accessibleTables}/${totalTables} tabel dapat diakses.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        variant: 'destructive',
        title: 'Test Koneksi Gagal',
        description: 'Tidak dapat mengakses database. Pastikan tabel sudah dibuat di Supabase.'
      });
    }
    setIsTestingConnection(false);
  };

  // Seed sample data
  const seedSampleData = async () => {
    setIsSeedingData(true);
    try {
      const response = await fetch('/api/resource-optimization/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to seed data');
      
      const result = await response.json();
      
      if (result.success) {
        let successCount = 0;
        let totalTypes = 0;
        
        Object.entries(result.results.seeded_data).forEach(([, data]) => {
          totalTypes++;
          if ((data as { success: boolean }).success) successCount++;
        });
        
        toast({
          title: 'Sample Data Berhasil Ditambahkan!',
          description: `${successCount}/${totalTypes} jenis data berhasil dibuat. Refresh untuk melihat data.`,
        });
        
        // Auto refresh data after seeding
        setTimeout(() => {
          loadResourceData();
        }, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Data Gagal',
        description: 'Tidak dapat menambahkan sample data. Pastikan tabel sudah dibuat.'
      });
    }
    setIsSeedingData(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadResourceData();
    }
  }, [user?.id, loadResourceData]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDecisionTypeIcon = (decisionType: string) => {
    switch (decisionType?.toLowerCase()) {
      case 'inventory':
      case 'inventory_reorder':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'workforce':
      case 'hr_optimization':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'operational':
      case 'process_optimization':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'financial':
      case 'cost_optimization':
        return <DollarSign className="h-5 w-5 text-orange-500" />;
      default:
        return <Settings className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAutoImplementStatus = (decision: ResourceData['decisions'][0]) => {
    if (decision.status === 'implemented') return 'Auto';
    if ((decision.impact_prediction?.efficiency_improvement ?? 0) >= 85) return 'Auto';
    return 'Manual';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline flex items-center">
            <Activity className="mr-3 h-8 w-8 text-primary" />
            Resource Optimization Hub
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline flex items-center">
          <Activity className="mr-3 h-8 w-8 text-primary" />
          Resource Optimization Hub
        </h1>
        <p className="text-muted-foreground">
          AI-powered optimization untuk Supply Chain, Finance, HR, dan Operations
        </p>
      </div>

      {/* Setup Instructions */}
      {(!resourceData || (resourceData.inventory?.length === 0 && resourceData.workforce?.length === 0)) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Setup Resource Optimization Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-4">Untuk memulai, ikuti langkah berikut:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Test Database:</strong> Pastikan semua tabel database sudah dibuat</li>
              <li><strong>Add Sample Data:</strong> Tambahkan contoh data untuk testing</li>
              <li><strong>Run AI Analysis:</strong> Jalankan analisis AI untuk mendapatkan rekomendasi</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <p className="text-xs"><strong>Note:</strong> Jika ada error, pastikan Anda sudah menjalankan SQL schema di Supabase Dashboard.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Primary Actions */}
        <div className="flex gap-2">
          <Button onClick={performAnalysis} disabled={isAnalyzing} size="lg" className="flex-1">
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Run AI Analysis
              </>
            )}
          </Button>
          <Button variant="outline" onClick={loadResourceData} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Setup Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testDatabaseConnection} 
            disabled={isTestingConnection}
            className="flex-1"
          >
            {isTestingConnection ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Test Database
              </>
            )}
          </Button>
          <Button 
            variant="secondary" 
            onClick={seedSampleData} 
            disabled={isSeedingData}
            className="flex-1"
          >
            {isSeedingData ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Add Sample Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Health Score & Critical Issues */}
      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className={`text-4xl font-bold ${getHealthScoreColor(analysis.overall_health_score)}`}>
                  {analysis.overall_health_score}%
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={analysis.overall_health_score} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Score kesehatan resource secara keseluruhan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical Issues</CardTitle>
              <CardDescription>Issues yang memerlukan perhatian segera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.critical_issues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Action: {issue.immediate_action}
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="overview">Financial Impact</TabsTrigger>
          <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Resource Efficiency Cards */}
          {analysis && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.resource_efficiency.inventory_optimization}%
                  </div>
                  <Progress value={analysis.resource_efficiency.inventory_optimization} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Workforce</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.resource_efficiency.workforce_utilization}%
                  </div>
                  <Progress value={analysis.resource_efficiency.workforce_utilization} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Operations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.resource_efficiency.operational_efficiency}%
                  </div>
                  <Progress value={analysis.resource_efficiency.operational_efficiency} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Impact */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Projected Financial Impact</CardTitle>
                <CardDescription>Dampak finansial dari optimasi yang direkomendasikan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Rp {analysis.financial_impact.potential_cost_savings.toLocaleString('id-ID')}
                    </div>
                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      Rp {analysis.financial_impact.cash_flow_improvement.toLocaleString('id-ID')}
                    </div>
                    <p className="text-sm text-muted-foreground">Cash Flow Improvement</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.financial_impact.roi_percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">Expected ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          {/* AI Optimization Decisions */}
          {resourceData?.decisions && resourceData.decisions.length > 0 ? (
            <div className="space-y-4">
              {resourceData.decisions.map((decision) => (
                <Card key={decision.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDecisionTypeIcon(decision.decision_type)}
                        <div>
                          <CardTitle className="text-lg capitalize">{decision.decision_type.replace('_', ' ')}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {decision.ai_recommendation.length > 100 
                              ? decision.ai_recommendation.substring(0, 100) + '...' 
                              : decision.ai_recommendation
                            }
                          </p>
                        </div>
                        <Badge variant={decision.status === 'pending' ? 'outline' : 'default'}>
                          {getAutoImplementStatus(decision)}
                        </Badge>
                      </div>
                      <Badge variant={
                        decision.status === 'pending' ? 'secondary' :
                        decision.status === 'implemented' ? 'default' :
                        decision.status === 'approved' ? 'default' :
                        'destructive'
                      }>
                        {decision.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {decision.ai_recommendation}
                    </p>
                    
                    {/* Implementation Steps */}
                    {decision.impact_prediction?.implementation_steps && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2">Implementation Steps:</h5>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                          {decision.impact_prediction.implementation_steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          Efficiency: {decision.impact_prediction?.efficiency_improvement || 85}%
                        </span>
                        <span className="text-sm text-green-600">
                          Expected: Rp {decision.impact_prediction?.cost_savings?.toLocaleString('id-ID') || '500,000'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(decision.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {decision.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => implementDecision(decision.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Implement
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDecisionStatus(decision.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDecisionStatus(decision.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {decision.status === 'implemented' && (
                          <Badge variant="default" className="bg-green-600">
                            ✅ Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Optimization Decisions</h3>
                <p className="text-muted-foreground mb-4">
                  Run AI analysis to get optimization recommendations
                </p>
                <Button onClick={performAnalysis} disabled={isAnalyzing}>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resource Management Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Resource Management</h2>
              <p className="text-muted-foreground">Kelola data inventory, workforce, operasional, dan keuangan</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => setShowInventoryForm(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Inventory
              </Button>
              <Button 
                onClick={() => setShowWorkforceForm(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
              <Button 
                onClick={() => setShowOperationalForm(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
              <Button 
                onClick={() => setShowFinancialForm(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Financial
              </Button>
            </div>
          </div>

          {/* Resource Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourceData?.inventory?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total items in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourceData?.workforce?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Operations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourceData?.operations?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Operational metrics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Financials</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourceData?.financials?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Financial records
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Tables */}
          <div className="grid gap-6">
            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory Items</CardTitle>
                  <Button 
                    onClick={() => setShowInventoryForm(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourceData?.inventory && resourceData.inventory.length > 0 ? (
                  <div className="space-y-2">
                    {resourceData.inventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.item_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Stock: {item.quantity || 0} | Min: {item.reorder_level || 0}
                            {item.sku && ` | SKU: ${item.sku}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(item.quantity ?? 0) <= (item.reorder_level ?? 0) && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editInventory(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteInventoryItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inventory items yet. Add your first item to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workforce Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Workforce</CardTitle>
                  <Button 
                    onClick={() => setShowWorkforceForm(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourceData?.workforce && resourceData.workforce.length > 0 ? (
                  <div className="space-y-2">
                    {resourceData.workforce.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{employee.metric_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Value: {employee.metric_value} | Date: {employee.metric_date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {employee.metric_value >= 90 && (
                            <Badge variant="default">High Value</Badge>
                          )}
                          {employee.metric_value < 60 && (
                            <Badge variant="destructive">Low Value</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editWorkforce(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteWorkforceItem(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No employees yet. Add your first employee to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operational Metrics Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Operational Metrics</CardTitle>
                  <Button 
                    onClick={() => setShowOperationalForm(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourceData?.operations && resourceData.operations.length > 0 ? (
                  <div className="space-y-2">
                    {resourceData.operations.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{metric.process_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Process: {metric.process_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.efficiency_rate >= 80 && (
                            <Badge variant="default">High Efficiency</Badge>
                          )}
                          {metric.efficiency_rate < 60 && (
                            <Badge variant="destructive">Low Efficiency</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editOperational(metric)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteOperationalMetric(metric.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No operational metrics yet. Add your first metric to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Data Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Financial Data</CardTitle>
                  <Button 
                    onClick={() => setShowFinancialForm(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Financial
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resourceData?.financials && resourceData.financials.length > 0 ? (
                  <div className="space-y-2">
                    {resourceData.financials.map((financial) => (
                      <div key={financial.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">Financial Record</div>
                          <div className="text-sm text-muted-foreground">
                            Revenue: Rp {financial.revenue.toLocaleString('id-ID')} | 
                            Expenses: Rp {financial.expenses.toLocaleString('id-ID')} | 
                            Profit: Rp {(financial.revenue - financial.expenses).toLocaleString('id-ID')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(financial.revenue - financial.expenses) > 0 && (
                            <Badge variant="default">Profitable</Badge>
                          )}
                          {(financial.revenue - financial.expenses) < 0 && (
                            <Badge variant="destructive">Loss</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editFinancial(financial)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFinancialData(financial.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No financial data yet. Add your first financial record to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">AI-powered insights dan analisis mendalam resource bisnis Anda</p>
            </div>
            <Button onClick={performAnalysis} disabled={isAnalyzing} variant="outline">
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>

          {analysis ? (
            <div className="space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overall Health</p>
                        <p className={`text-2xl font-bold ${
                          getHealthScoreColor(analysis.overall_health_score)
                        }`}>
                          {analysis.overall_health_score}%
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analysis.critical_issues.length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                        <p className="text-2xl font-bold text-green-600">
                          Rp {(analysis.financial_impact.potential_cost_savings / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Expected ROI</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {analysis.financial_impact.roi_percentage}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resource Efficiency Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Efficiency Analysis</CardTitle>
                  <CardDescription>
                    AI analysis mengenai efisiensi resource berdasarkan data terkini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Inventory Optimization</span>
                          </div>
                          <span className="text-sm font-bold">{analysis.resource_efficiency.inventory_optimization}%</span>
                        </div>
                        <Progress value={analysis.resource_efficiency.inventory_optimization} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {analysis.resource_efficiency.inventory_optimization >= 80 
                            ? "Excellent inventory management" 
                            : analysis.resource_efficiency.inventory_optimization >= 60
                              ? "Good but needs improvement"
                              : "Requires immediate attention"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Workforce Utilization</span>
                          </div>
                          <span className="text-sm font-bold">{analysis.resource_efficiency.workforce_utilization}%</span>
                        </div>
                        <Progress value={analysis.resource_efficiency.workforce_utilization} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {analysis.resource_efficiency.workforce_utilization >= 80 
                            ? "High performing team" 
                            : analysis.resource_efficiency.workforce_utilization >= 60
                              ? "Team performing well"
                              : "Team needs support"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Operational Efficiency</span>
                          </div>
                          <span className="text-sm font-bold">{analysis.resource_efficiency.operational_efficiency}%</span>
                        </div>
                        <Progress value={analysis.resource_efficiency.operational_efficiency} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {analysis.resource_efficiency.operational_efficiency >= 80 
                            ? "Operations running smoothly" 
                            : analysis.resource_efficiency.operational_efficiency >= 60
                              ? "Operations need optimization"
                              : "Critical operational issues"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top AI Recommendations</CardTitle>
                  <CardDescription>
                    Rekomendasi prioritas berdasarkan analisis AI dengan model Llama 4 Scout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.optimization_recommendations.slice(0, 5).map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getPriorityIcon(recommendation.priority)}
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'default'}>
                                {recommendation.priority}
                              </Badge>
                              {recommendation.auto_implementable && (
                                <Badge variant="secondary">Auto-Implementable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {recommendation.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="text-green-600">
                                💰 Savings: Rp {recommendation.expected_savings.toLocaleString('id-ID')}
                              </span>
                              <span className="text-blue-600">
                                🎯 Confidence: {recommendation.confidence_score}%
                              </span>
                              <span className="text-purple-600">
                                📂 Category: {recommendation.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Implementation Steps */}
                        {recommendation.implementation_steps.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h5 className="text-sm font-medium mb-2">Implementation Steps:</h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {recommendation.implementation_steps.slice(0, 3).map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Impact Detail */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Impact Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-sm font-medium">Cost Savings Potential</span>
                        <span className="font-bold text-green-600">
                          Rp {analysis.financial_impact.potential_cost_savings.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium">Cash Flow Improvement</span>
                        <span className="font-bold text-blue-600">
                          Rp {analysis.financial_impact.cash_flow_improvement.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                        <span className="text-sm font-medium">Expected ROI</span>
                        <span className="font-bold text-purple-600">
                          {analysis.financial_impact.roi_percentage}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Critical Issues Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.critical_issues.length > 0 ? (
                        analysis.critical_issues.map((issue, index) => (
                          <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="destructive">{issue.severity}</Badge>
                              <span className="font-medium text-sm">{issue.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                            <p className="text-xs text-red-600 mt-2">
                              <strong>Action:</strong> {issue.immediate_action}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium">No Critical Issues</p>
                          <p className="text-xs text-muted-foreground">Semua resource berjalan dengan baik</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Analytics Ready</h3>
                <p className="text-muted-foreground mb-4">
                  Run AI analysis untuk mendapatkan insights mendalam tentang resource bisnis Anda
                </p>
                <Button onClick={performAnalysis} disabled={isAnalyzing} size="lg">
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialogs */}
      <Dialog open={showInventoryForm} onOpenChange={(open) => {
        setShowInventoryForm(open);
        if (!open) {
          setEditingInventory(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInventory ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingInventory}
            onSubmit={handleInventorySubmit}
            onCancel={() => {
              setShowInventoryForm(false);
              setEditingInventory(null);
            }}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkforceForm} onOpenChange={(open) => {
        setShowWorkforceForm(open);
        if (!open) {
          setEditingWorkforce(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkforce ? 'Edit Employee' : 'Add Employee'}
            </DialogTitle>
          </DialogHeader>
          <WorkforceForm
            metric={editingWorkforce}
            onSubmit={handleWorkforceSubmit}
            onCancel={() => {
              setShowWorkforceForm(false);
              setEditingWorkforce(null);
            }}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showOperationalForm} onOpenChange={(open) => {
        setShowOperationalForm(open);
        if (!open) {
          setEditingOperational(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOperational ? 'Edit Operational Metric' : 'Add Operational Metric'}
            </DialogTitle>
          </DialogHeader>
          <OperationalForm
            metric={editingOperational}
            onSubmit={handleOperationalSubmit}
            onCancel={() => {
              setShowOperationalForm(false);
              setEditingOperational(null);
            }}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showFinancialForm} onOpenChange={(open) => {
        setShowFinancialForm(open);
        if (!open) {
          setEditingFinancial(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFinancial ? 'Edit Financial Data' : 'Add Financial Data'}
            </DialogTitle>
          </DialogHeader>
          <FinancialForm
            insight={editingFinancial}
            onSubmit={handleFinancialSubmit}
            onCancel={() => {
              setShowFinancialForm(false);
              setEditingFinancial(null);
            }}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
