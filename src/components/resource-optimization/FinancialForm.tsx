"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, Edit } from 'lucide-react';

interface FinancialInsight {
  id?: string;
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

interface FinancialFormProps {
  insight?: FinancialInsight | null;
  onSubmit: (insight: FinancialInsight) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FinancialForm({ insight, onSubmit, onCancel, isLoading = false }: FinancialFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FinancialInsight>({
    revenue: insight?.revenue || 0,
    expenses: insight?.expenses || 0,
    assets: insight?.assets || 0,
    liabilities: insight?.liabilities || 0,
    market_trends: insight?.market_trends || '',
    business_goals: insight?.business_goals || '',
    cash_flow_analysis: insight?.cash_flow_analysis || '',
    profitability_analysis: insight?.profitability_analysis || '',
    investment_opportunities: insight?.investment_opportunities || '',
    recommendations: insight?.recommendations || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.revenue < 0) {
      newErrors.revenue = 'Revenue tidak boleh negatif';
    }

    if (formData.expenses < 0) {
      newErrors.expenses = 'Expenses tidak boleh negatif';
    }

    if ((formData.assets || 0) < 0) {
      newErrors.assets = 'Assets tidak boleh negatif';
    }

    if ((formData.liabilities || 0) < 0) {
      newErrors.liabilities = 'Liabilities tidak boleh negatif';
    }

    // Minimal data validation
    if (formData.revenue === 0 && formData.expenses === 0) {
      newErrors.revenue = 'Revenue atau Expenses minimal salah satu harus diisi';
      newErrors.expenses = 'Revenue atau Expenses minimal salah satu harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Form Validation Error',
        description: 'Mohon perbaiki input yang tidak valid'
      });
      return;
    }

    try {
      await onSubmit({ ...formData, id: insight?.id });
      toast({
        title: insight ? 'Financial Data Updated!' : 'Financial Data Added!',
        description: `Data keuangan berhasil ${insight ? 'diupdate' : 'ditambahkan'}.`
      });
    } catch (error) {
      console.error('Error submitting financial insight:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: `Gagal ${insight ? 'mengupdate' : 'menambahkan'} data keuangan.`
      });
    }
  };

  const handleInputChange = (field: keyof FinancialInsight, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Calculate derived financial metrics
  const netProfit = formData.revenue - formData.expenses;
  const profitMargin = formData.revenue > 0 ? ((netProfit / formData.revenue) * 100) : 0;
  const netWorth = (formData.assets || 0) - (formData.liabilities || 0);
  const isHealthy = netProfit > 0 && profitMargin > 10;

  const isEditing = !!insight?.id;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Financial Data
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Tambah Data Keuangan
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update data keuangan dan analisis bisnis' 
            : 'Masukkan data keuangan bisnis untuk analisis AI yang komprehensif'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Financial Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Keuangan Utama</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue (Pendapatan) *</Label>
                <Input
                  id="revenue"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                  placeholder="50000000"
                  className={errors.revenue ? 'border-red-500' : ''}
                />
                {errors.revenue && (
                  <p className="text-sm text-red-500">{errors.revenue}</p>
                )}
                {formData.revenue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Rp {formData.revenue.toLocaleString('id-ID')} per periode
                  </p>
                )}
              </div>

              {/* Expenses */}
              <div className="space-y-2">
                <Label htmlFor="expenses">Expenses (Pengeluaran) *</Label>
                <Input
                  id="expenses"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.expenses}
                  onChange={(e) => handleInputChange('expenses', parseInt(e.target.value) || 0)}
                  placeholder="35000000"
                  className={errors.expenses ? 'border-red-500' : ''}
                />
                {errors.expenses && (
                  <p className="text-sm text-red-500">{errors.expenses}</p>
                )}
                {formData.expenses > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Rp {formData.expenses.toLocaleString('id-ID')} per periode
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Assets & Liabilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assets & Liabilities (Opsional)</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Assets */}
              <div className="space-y-2">
                <Label htmlFor="assets">Total Assets (Aset)</Label>
                <Input
                  id="assets"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.assets || 0}
                  onChange={(e) => handleInputChange('assets', parseInt(e.target.value) || 0)}
                  placeholder="100000000"
                  className={errors.assets ? 'border-red-500' : ''}
                />
                {errors.assets && (
                  <p className="text-sm text-red-500">{errors.assets}</p>
                )}
                {(formData.assets || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Rp {(formData.assets || 0).toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Liabilities */}
              <div className="space-y-2">
                <Label htmlFor="liabilities">Total Liabilities (Kewajiban)</Label>
                <Input
                  id="liabilities"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.liabilities || 0}
                  onChange={(e) => handleInputChange('liabilities', parseInt(e.target.value) || 0)}
                  placeholder="25000000"
                  className={errors.liabilities ? 'border-red-500' : ''}
                />
                {errors.liabilities && (
                  <p className="text-sm text-red-500">{errors.liabilities}</p>
                )}
                {(formData.liabilities || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Rp {(formData.liabilities || 0).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Analisis Bisnis (Opsional)</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Market Trends */}
              <div className="space-y-2">
                <Label htmlFor="market_trends">Market Trends</Label>
                <Textarea
                  id="market_trends"
                  value={formData.market_trends || ''}
                  onChange={(e) => handleInputChange('market_trends', e.target.value)}
                  placeholder="Contoh: Permintaan produk digital meningkat 30%, kompetisi pricing ketat..."
                  rows={2}
                />
              </div>

              {/* Business Goals */}
              <div className="space-y-2">
                <Label htmlFor="business_goals">Business Goals</Label>
                <Textarea
                  id="business_goals"
                  value={formData.business_goals || ''}
                  onChange={(e) => handleInputChange('business_goals', e.target.value)}
                  placeholder="Contoh: Meningkatkan revenue 25% dalam 6 bulan, ekspansi ke 3 kota baru..."
                  rows={2}
                />
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations || ''}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  placeholder="Contoh: Optimasi biaya operasional, diversifikasi produk, investasi teknologi..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          {(formData.revenue > 0 || formData.expenses > 0) && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Ringkasan Keuangan:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Net Profit</div>
                  <div className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {netProfit.toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground">Profit Margin</div>
                  <div className={`font-bold ${profitMargin >= 10 ? 'text-green-600' : profitMargin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
                
                {((formData.assets || 0) > 0 || (formData.liabilities || 0) > 0) && (
                  <div>
                    <div className="text-muted-foreground">Net Worth</div>
                    <div className={`font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rp {netWorth.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-muted-foreground">Health Status</div>
                  <div className={`font-bold ${isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isHealthy ? 'Healthy' : 'Monitor'}
                  </div>
                </div>
              </div>
              
              {/* Quick Insights */}
              <div className="mt-3 text-xs text-muted-foreground">
                {profitMargin < 0 && (
                  <div className="text-red-600">⚠️ Bisnis mengalami kerugian, perlu optimasi cost struktur</div>
                )}
                {profitMargin >= 0 && profitMargin < 5 && (
                  <div className="text-yellow-600">💡 Profit margin rendah, cari peluang efisiensi atau pricing strategy</div>
                )}
                {profitMargin >= 20 && (
                  <div className="text-green-600">🎉 Profit margin sangat baik, pertimbangkan reinvestment untuk growth</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Data' : 'Tambah Data'}
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}