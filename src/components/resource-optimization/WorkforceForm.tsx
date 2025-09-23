"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Edit } from 'lucide-react';

interface WorkforceMetric {
  id?: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
}

interface WorkforceFormProps {
  metric?: WorkforceMetric | null;
  onSubmit: (metric: WorkforceMetric) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Predefined metric types untuk UKM Indonesia
const WORKFORCE_METRIC_TYPES = [
  { value: 'Employee Satisfaction Score', label: 'Employee Satisfaction Score (1-10)', unit: 'score', max: 10 },
  { value: 'Average Productivity Index', label: 'Average Productivity Index (%)', unit: '%', max: 100 },
  { value: 'Training Hours Completed', label: 'Training Hours Completed', unit: 'hours', max: 1000 },
  { value: 'Overtime Hours per Employee', label: 'Overtime Hours per Employee', unit: 'hours', max: 200 },
  { value: 'Team Collaboration Score', label: 'Team Collaboration Score (1-10)', unit: 'score', max: 10 },
  { value: 'Employee Retention Rate', label: 'Employee Retention Rate (%)', unit: '%', max: 100 },
  { value: 'Average Performance Rating', label: 'Average Performance Rating (1-5)', unit: 'rating', max: 5 },
  { value: 'Skills Development Score', label: 'Skills Development Score (%)', unit: '%', max: 100 },
  { value: 'Work-Life Balance Score', label: 'Work-Life Balance Score (1-10)', unit: 'score', max: 10 },
  { value: 'Employee Engagement Index', label: 'Employee Engagement Index (%)', unit: '%', max: 100 }
];

export default function WorkforceForm({ metric, onSubmit, onCancel, isLoading = false }: WorkforceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<WorkforceMetric>({
    metric_name: metric?.metric_name || '',
    metric_value: metric?.metric_value || 0,
    metric_date: metric?.metric_date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMetricType = WORKFORCE_METRIC_TYPES.find(type => type.value === formData.metric_name);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.metric_name.trim()) {
      newErrors.metric_name = 'Tipe metric harus dipilih';
    }

    if (formData.metric_value < 0) {
      newErrors.metric_value = 'Nilai metric tidak boleh negatif';
    }

    if (selectedMetricType && formData.metric_value > selectedMetricType.max) {
      newErrors.metric_value = `Nilai metric tidak boleh lebih dari ${selectedMetricType.max}`;
    }

    if (!formData.metric_date) {
      newErrors.metric_date = 'Tanggal harus diisi';
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
        title: metric ? 'Metric Updated!' : 'Metric Added!',
        description: `${formData.metric_name} berhasil ${metric ? 'diupdate' : 'ditambahkan'}.`
      });
    } catch (error) {
      console.error('Error submitting workforce metric:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: `Gagal ${metric ? 'mengupdate' : 'menambahkan'} workforce metric.`
      });
    }
  };

  const handleInputChange = (field: keyof WorkforceMetric, value: string | number) => {
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

  const handleMetricTypeChange = (metricName: string) => {
    setFormData(prev => ({
      ...prev,
      metric_name: metricName,
      metric_value: 0 // Reset value when metric type changes
    }));
    
    // Clear errors
    setErrors(prev => ({
      ...prev,
      metric_name: '',
      metric_value: ''
    }));
  };

  const getPerformanceColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isEditing = !!metric?.id;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Workforce Metric
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Tambah Workforce Metric
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update data workforce metric yang sudah ada' 
            : 'Masukkan data kinerja karyawan dan tim untuk analisis AI yang lebih akurat'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metric Type */}
          <div className="space-y-2">
            <Label>Tipe Metric *</Label>
            <Select 
              value={formData.metric_name} 
              onValueChange={handleMetricTypeChange}
            >
              <SelectTrigger className={errors.metric_name ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih tipe workforce metric..." />
              </SelectTrigger>
              <SelectContent>
                {WORKFORCE_METRIC_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metric_name && (
              <p className="text-sm text-red-500">{errors.metric_name}</p>
            )}
          </div>

          {/* Metric Value */}
          <div className="space-y-2">
            <Label htmlFor="metric_value">
              Nilai Metric * 
              {selectedMetricType && (
                <span className="text-muted-foreground ml-1">
                  (Max: {selectedMetricType.max} {selectedMetricType.unit})
                </span>
              )}
            </Label>
            <Input
              id="metric_value"
              type="number"
              min="0"
              max={selectedMetricType?.max || 1000}
              step={selectedMetricType?.unit === '%' ? "0.1" : "1"}
              value={formData.metric_value}
              onChange={(e) => handleInputChange('metric_value', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className={errors.metric_value ? 'border-red-500' : ''}
            />
            {errors.metric_value && (
              <p className="text-sm text-red-500">{errors.metric_value}</p>
            )}
            
            {/* Performance Indicator */}
            {selectedMetricType && formData.metric_value > 0 && (
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  Performance: 
                  <span className={`ml-1 font-medium ${
                    getPerformanceColor(formData.metric_value, selectedMetricType.max)
                  }`}>
                    {((formData.metric_value / selectedMetricType.max) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ({formData.metric_value} / {selectedMetricType.max} {selectedMetricType.unit})
                </div>
              </div>
            )}
          </div>

          {/* Metric Date */}
          <div className="space-y-2">
            <Label htmlFor="metric_date">Tanggal Metric *</Label>
            <Input
              id="metric_date"
              type="date"
              value={formData.metric_date}
              onChange={(e) => handleInputChange('metric_date', e.target.value)}
              className={errors.metric_date ? 'border-red-500' : ''}
            />
            {errors.metric_date && (
              <p className="text-sm text-red-500">{errors.metric_date}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Pilih tanggal pengukuran metric ini
            </p>
          </div>

          {/* Metric Insights */}
          {selectedMetricType && formData.metric_value > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Insight Metric:</h4>
              <div className="text-sm space-y-1">
                <div>
                  <strong>{selectedMetricType.label}:</strong> {formData.metric_value} {selectedMetricType.unit}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-1 ${
                    getPerformanceColor(formData.metric_value, selectedMetricType.max)
                  }`}>
                    {((formData.metric_value / selectedMetricType.max) * 100) >= 80 
                      ? 'Excellent' 
                      : ((formData.metric_value / selectedMetricType.max) * 100) >= 60 
                        ? 'Good' 
                        : 'Needs Improvement'
                    }
                  </span>
                </div>
                {selectedMetricType.value.includes('Satisfaction') && formData.metric_value < 7 && (
                  <div className="text-orange-600 text-xs mt-1">
                    💡 Pertimbangkan program employee engagement untuk meningkatkan kepuasan
                  </div>
                )}
                {selectedMetricType.value.includes('Productivity') && formData.metric_value < 75 && (
                  <div className="text-orange-600 text-xs mt-1">
                    💡 Analisis workflow dan berikan training untuk meningkatkan produktivitas
                  </div>
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
                  <Users className="mr-2 h-4 w-4" />
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