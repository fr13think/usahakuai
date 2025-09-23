"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Edit, Activity, Clock } from 'lucide-react';

interface OperationalMetric {
  id?: string;
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

interface OperationalFormProps {
  metric?: OperationalMetric | null;
  onSubmit: (metric: OperationalMetric) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function OperationalForm({ metric, onSubmit, onCancel, isLoading = false }: OperationalFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OperationalMetric>({
    department: metric?.department || '',
    process_name: metric?.process_name || '',
    efficiency_rate: metric?.efficiency_rate || 0,
    cycle_time: metric?.cycle_time || 0,
    error_rate: metric?.error_rate || 0,
    throughput: metric?.throughput || 0,
    capacity_utilization: metric?.capacity_utilization || 0,
    quality_score: metric?.quality_score || 0,
    bottleneck_areas: metric?.bottleneck_areas || '',
    improvement_suggestions: metric?.improvement_suggestions || '',
    automation_level: metric?.automation_level || 'Low',
    cost_per_unit: metric?.cost_per_unit || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.department.trim()) {
      newErrors.department = 'Department wajib diisi';
    }

    if (!formData.process_name.trim()) {
      newErrors.process_name = 'Nama proses wajib diisi';
    }

    if (formData.efficiency_rate < 0 || formData.efficiency_rate > 100) {
      newErrors.efficiency_rate = 'Efficiency rate harus antara 0-100%';
    }

    if (formData.cycle_time <= 0) {
      newErrors.cycle_time = 'Cycle time harus lebih dari 0';
    }

    if (formData.error_rate < 0 || formData.error_rate > 100) {
      newErrors.error_rate = 'Error rate harus antara 0-100%';
    }

    if (formData.throughput < 0) {
      newErrors.throughput = 'Throughput tidak boleh negatif';
    }

    if (formData.capacity_utilization < 0 || formData.capacity_utilization > 100) {
      newErrors.capacity_utilization = 'Capacity utilization harus antara 0-100%';
    }

    if (formData.quality_score && (formData.quality_score < 0 || formData.quality_score > 100)) {
      newErrors.quality_score = 'Quality score harus antara 0-100';
    }

    if (formData.cost_per_unit && formData.cost_per_unit < 0) {
      newErrors.cost_per_unit = 'Cost per unit tidak boleh negatif';
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
      await onSubmit({ ...formData, id: metric?.id });
      toast({
        title: metric ? 'Operational Metric Updated!' : 'Operational Metric Added!',
        description: `Operational metric berhasil ${metric ? 'diupdate' : 'ditambahkan'}.`
      });
    } catch (error) {
      console.error('Error submitting operational metric:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: `Gagal ${metric ? 'mengupdate' : 'menambahkan'} operational metric.`
      });
    }
  };

  const handleInputChange = (field: keyof OperationalMetric, value: string | number) => {
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

  // Calculate operational insights
  const operationalEfficiency = (formData.efficiency_rate + formData.capacity_utilization + (100 - formData.error_rate)) / 3;
  const isHighPerforming = operationalEfficiency >= 80;
  const needsImprovement = operationalEfficiency < 60;

  const isEditing = !!metric?.id;

  const departments = [
    'Production', 'Manufacturing', 'Operations', 'Quality Control',
    'Supply Chain', 'Logistics', 'Customer Service', 'Sales',
    'Marketing', 'IT', 'HR', 'Finance', 'R&D', 'Other'
  ];

  const automationLevels = ['Low', 'Medium', 'High', 'Fully Automated'];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Operational Metric
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Tambah Operational Metric
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update data operational dan proses bisnis' 
            : 'Masukkan data operational untuk analisis efisiensi dan optimasi proses'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              {/* Process Name */}
              <div className="space-y-2">
                <Label htmlFor="process_name">Nama Proses *</Label>
                <Input
                  id="process_name"
                  value={formData.process_name}
                  onChange={(e) => handleInputChange('process_name', e.target.value)}
                  placeholder="Contoh: Order Processing, Quality Inspection"
                  className={errors.process_name ? 'border-red-500' : ''}
                />
                {errors.process_name && (
                  <p className="text-sm text-red-500">{errors.process_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metrics Performa</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Efficiency Rate */}
              <div className="space-y-2">
                <Label htmlFor="efficiency_rate">Efficiency Rate (%) *</Label>
                <Input
                  id="efficiency_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.efficiency_rate}
                  onChange={(e) => handleInputChange('efficiency_rate', parseFloat(e.target.value) || 0)}
                  placeholder="85.5"
                  className={errors.efficiency_rate ? 'border-red-500' : ''}
                />
                {errors.efficiency_rate && (
                  <p className="text-sm text-red-500">{errors.efficiency_rate}</p>
                )}
                {formData.efficiency_rate > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.efficiency_rate >= 80 ? '🟢 Excellent' : 
                     formData.efficiency_rate >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                  </p>
                )}
              </div>

              {/* Cycle Time */}
              <div className="space-y-2">
                <Label htmlFor="cycle_time">Cycle Time (menit) *</Label>
                <Input
                  id="cycle_time"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.cycle_time}
                  onChange={(e) => handleInputChange('cycle_time', parseFloat(e.target.value) || 0)}
                  placeholder="45.5"
                  className={errors.cycle_time ? 'border-red-500' : ''}
                />
                {errors.cycle_time && (
                  <p className="text-sm text-red-500">{errors.cycle_time}</p>
                )}
                {formData.cycle_time > 0 && (
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline w-3 h-3 mr-1" />
                    {formData.cycle_time} menit per siklus
                  </p>
                )}
              </div>

              {/* Error Rate */}
              <div className="space-y-2">
                <Label htmlFor="error_rate">Error Rate (%) *</Label>
                <Input
                  id="error_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.error_rate}
                  onChange={(e) => handleInputChange('error_rate', parseFloat(e.target.value) || 0)}
                  placeholder="2.5"
                  className={errors.error_rate ? 'border-red-500' : ''}
                />
                {errors.error_rate && (
                  <p className="text-sm text-red-500">{errors.error_rate}</p>
                )}
                {formData.error_rate >= 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.error_rate <= 2 ? '🟢 Excellent' : 
                     formData.error_rate <= 5 ? '🟡 Acceptable' : '🔴 High'}
                  </p>
                )}
              </div>

              {/* Throughput */}
              <div className="space-y-2">
                <Label htmlFor="throughput">Throughput (unit/hari) *</Label>
                <Input
                  id="throughput"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.throughput}
                  onChange={(e) => handleInputChange('throughput', parseInt(e.target.value) || 0)}
                  placeholder="150"
                  className={errors.throughput ? 'border-red-500' : ''}
                />
                {errors.throughput && (
                  <p className="text-sm text-red-500">{errors.throughput}</p>
                )}
                {formData.throughput > 0 && (
                  <p className="text-xs text-muted-foreground">
                    <Activity className="inline w-3 h-3 mr-1" />
                    {formData.throughput.toLocaleString('id-ID')} unit/hari
                  </p>
                )}
              </div>

              {/* Capacity Utilization */}
              <div className="space-y-2">
                <Label htmlFor="capacity_utilization">Capacity Utilization (%) *</Label>
                <Input
                  id="capacity_utilization"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.capacity_utilization}
                  onChange={(e) => handleInputChange('capacity_utilization', parseFloat(e.target.value) || 0)}
                  placeholder="75.0"
                  className={errors.capacity_utilization ? 'border-red-500' : ''}
                />
                {errors.capacity_utilization && (
                  <p className="text-sm text-red-500">{errors.capacity_utilization}</p>
                )}
                {formData.capacity_utilization > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.capacity_utilization >= 80 ? '🟢 High Utilization' : 
                     formData.capacity_utilization >= 60 ? '🟡 Medium Utilization' : '🔴 Under-utilized'}
                  </p>
                )}
              </div>

              {/* Quality Score */}
              <div className="space-y-2">
                <Label htmlFor="quality_score">Quality Score (0-100)</Label>
                <Input
                  id="quality_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.quality_score || 0}
                  onChange={(e) => handleInputChange('quality_score', parseFloat(e.target.value) || 0)}
                  placeholder="92.5"
                  className={errors.quality_score ? 'border-red-500' : ''}
                />
                {errors.quality_score && (
                  <p className="text-sm text-red-500">{errors.quality_score}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detail Tambahan</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Automation Level */}
              <div className="space-y-2">
                <Label htmlFor="automation_level">Automation Level</Label>
                <Select 
                  value={formData.automation_level || 'Low'} 
                  onValueChange={(value) => handleInputChange('automation_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {automationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost per Unit */}
              <div className="space-y-2">
                <Label htmlFor="cost_per_unit">Cost per Unit (Rp)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.cost_per_unit || 0}
                  onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                  className={errors.cost_per_unit ? 'border-red-500' : ''}
                />
                {errors.cost_per_unit && (
                  <p className="text-sm text-red-500">{errors.cost_per_unit}</p>
                )}
                {(formData.cost_per_unit || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Rp {(formData.cost_per_unit || 0).toLocaleString('id-ID')} per unit
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Bottleneck Areas */}
              <div className="space-y-2">
                <Label htmlFor="bottleneck_areas">Bottleneck Areas</Label>
                <Textarea
                  id="bottleneck_areas"
                  value={formData.bottleneck_areas || ''}
                  onChange={(e) => handleInputChange('bottleneck_areas', e.target.value)}
                  placeholder="Contoh: Proses approval memakan waktu lama, kapasitas mesin terbatas..."
                  rows={2}
                />
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-2">
                <Label htmlFor="improvement_suggestions">Improvement Suggestions</Label>
                <Textarea
                  id="improvement_suggestions"
                  value={formData.improvement_suggestions || ''}
                  onChange={(e) => handleInputChange('improvement_suggestions', e.target.value)}
                  placeholder="Contoh: Implementasi automasi, pelatihan staff, upgrade equipment..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          {(formData.efficiency_rate > 0 || formData.capacity_utilization > 0) && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Ringkasan Performa:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Overall Efficiency</div>
                  <div className={`font-bold ${isHighPerforming ? 'text-green-600' : needsImprovement ? 'text-red-600' : 'text-yellow-600'}`}>
                    {operationalEfficiency.toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground">Performance Level</div>
                  <div className={`font-bold ${isHighPerforming ? 'text-green-600' : needsImprovement ? 'text-red-600' : 'text-yellow-600'}`}>
                    {isHighPerforming ? 'Excellent' : needsImprovement ? 'Poor' : 'Average'}
                  </div>
                </div>
                
                {formData.throughput > 0 && formData.cycle_time > 0 && (
                  <div>
                    <div className="text-muted-foreground">Daily Capacity</div>
                    <div className="font-bold text-blue-600">
                      {Math.round((8 * 60) / formData.cycle_time).toLocaleString('id-ID')} units
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Insights */}
              <div className="mt-3 text-xs text-muted-foreground">
                {needsImprovement && (
                  <div className="text-red-600">⚠️ Performa di bawah standar, perlu perbaikan segera</div>
                )}
                {formData.error_rate > 5 && (
                  <div className="text-yellow-600">💡 Error rate tinggi, fokus pada quality control</div>
                )}
                {formData.capacity_utilization < 50 && (
                  <div className="text-blue-600">📈 Kapasitas masih bisa dioptimalkan lebih tinggi</div>
                )}
                {isHighPerforming && (
                  <div className="text-green-600">🎉 Performa excellent! Pertimbangkan scale-up atau standarisasi best practice</div>
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
                  <Settings className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Metric' : 'Tambah Metric'}
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