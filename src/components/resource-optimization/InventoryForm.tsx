"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Edit } from 'lucide-react';

interface InventoryItem {
  id?: string;
  item_name: string;
  sku?: string | null;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  // Additional fields to match database schema
  current_stock?: number;
  minimum_stock?: number;
  category?: string | null;
  supplier?: string | null;
  location?: string | null;
  description?: string | null;
}

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSubmit: (item: InventoryItem) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function InventoryForm({ item, onSubmit, onCancel, isLoading = false }: InventoryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InventoryItem>({
    item_name: item?.item_name || '',
    sku: item?.sku || '',
    quantity: item?.quantity || 0,
    reorder_level: item?.reorder_level || 0,
    unit_cost: item?.unit_cost || 0,
    category: item?.category || '',
    supplier: item?.supplier || '',
    location: item?.location || '',
    description: item?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Nama item harus diisi';
    }

    // SKU is now optional (nullable in database)
    // if (!formData.sku?.trim()) {
    //   newErrors.sku = 'SKU harus diisi';
    // }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity tidak boleh negatif';
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = 'Reorder level tidak boleh negatif';
    }

    if (formData.unit_cost <= 0) {
      newErrors.unit_cost = 'Unit cost harus lebih dari 0';
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
      await onSubmit({ ...formData, id: item?.id });
      toast({
        title: item ? 'Item Updated!' : 'Item Added!',
        description: `${formData.item_name} berhasil ${item ? 'diupdate' : 'ditambahkan'}.`
      });
    } catch (error) {
      console.error('Error submitting inventory item:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: `Gagal ${item ? 'mengupdate' : 'menambahkan'} item inventory.`
      });
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
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

  const isEditing = !!item?.id;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Inventory Item
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Tambah Inventory Item
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update data inventory item yang sudah ada' 
            : 'Masukkan informasi inventory item baru untuk bisnis Anda'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="item_name">Nama Item *</Label>
            <Input
              id="item_name"
              type="text"
              value={formData.item_name}
              onChange={(e) => handleInputChange('item_name', e.target.value)}
              placeholder="Contoh: Laptop Dell Inspiron 15"
              className={errors.item_name ? 'border-red-500' : ''}
            />
            {errors.item_name && (
              <p className="text-sm text-red-500">{errors.item_name}</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Stock Keeping Unit) - Optional</Label>
            <Input
              id="sku"
              type="text"
              value={formData.sku || ''}
              onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
              placeholder="Contoh: LAPTOP-DELL-001"
              className={errors.sku ? 'border-red-500' : ''}
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku}</p>
            )}
          </div>

          {/* Quantity and Reorder Level Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Saat Ini</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => handleInputChange('reorder_level', parseInt(e.target.value) || 0)}
                placeholder="5"
                className={errors.reorder_level ? 'border-red-500' : ''}
              />
              {errors.reorder_level && (
                <p className="text-sm text-red-500">{errors.reorder_level}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum stock sebelum perlu reorder
              </p>
            </div>
          </div>

          {/* Unit Cost */}
          <div className="space-y-2">
            <Label htmlFor="unit_cost">Unit Cost (Rupiah) *</Label>
            <Input
              id="unit_cost"
              type="number"
              min="1"
              step="1"
              value={formData.unit_cost}
              onChange={(e) => handleInputChange('unit_cost', parseInt(e.target.value) || 0)}
              placeholder="8500000"
              className={errors.unit_cost ? 'border-red-500' : ''}
            />
            {errors.unit_cost && (
              <p className="text-sm text-red-500">{errors.unit_cost}</p>
            )}
            {formData.unit_cost > 0 && (
              <p className="text-xs text-muted-foreground">
                Rp {formData.unit_cost.toLocaleString('id-ID')} per unit
              </p>
            )}
          </div>

          {/* Additional Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Contoh: Electronics, Office Supplies"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Penyimpanan</Label>
              <Input
                id="location"
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Contoh: Gudang A-1-2"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              type="text"
              value={formData.supplier || ''}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
              placeholder="Contoh: PT. Teknologi Indonesia"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              type="text"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi atau catatan tambahan"
            />
          </div>

          {/* Summary */}
          {formData.quantity > 0 && formData.unit_cost > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Ringkasan Inventory:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Value: <strong>Rp {(formData.quantity * formData.unit_cost).toLocaleString('id-ID')}</strong></div>
                <div>Status Stock: 
                  <span className={`ml-1 font-medium ${
                    formData.quantity <= formData.reorder_level 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formData.quantity <= formData.reorder_level ? 'Low Stock' : 'Normal'}
                  </span>
                </div>
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
                  <Package className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Item' : 'Tambah Item'}
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