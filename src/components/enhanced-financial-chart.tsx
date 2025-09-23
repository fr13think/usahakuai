"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  isProjected?: boolean;
  isReal?: boolean;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgGrowth: number;
  profitMargin: number;
}

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Pengeluaran", 
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "Keuntungan",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// Generate realistic financial data based on business type and existing data
const generateProjectedData = (businessType?: string, baseRevenue?: number): FinancialData[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const base = baseRevenue || 150; // Base revenue in millions
  
  // Industry multipliers based on business type
  const industryMultipliers: Record<string, { revenue: number; expenses: number; volatility: number }> = {
    'retail': { revenue: 1.2, expenses: 0.7, volatility: 0.15 },
    'manufacturing': { revenue: 2.0, expenses: 1.4, volatility: 0.1 },
    'services': { revenue: 0.8, expenses: 0.5, volatility: 0.2 },
    'technology': { revenue: 1.5, expenses: 0.8, volatility: 0.25 },
    'food': { revenue: 1.0, expenses: 0.65, volatility: 0.12 },
    'default': { revenue: 1.0, expenses: 0.6, volatility: 0.15 }
  };
  
  const multiplier = industryMultipliers[businessType?.toLowerCase() || 'default'];
  
  return months.map((month, index) => {
    // Add growth trend and seasonal variation
    const growthFactor = 1 + (index * 0.05); // 5% monthly growth
    const seasonalFactor = 0.9 + 0.2 * Math.sin((index * Math.PI) / 3); // Seasonal variation
    const randomFactor = 0.9 + multiplier.volatility * Math.random();
    
    const revenue = Math.round(base * multiplier.revenue * growthFactor * seasonalFactor * randomFactor);
    const expenses = Math.round(revenue * multiplier.expenses * (0.9 + 0.2 * Math.random()));
    const profit = revenue - expenses;
    
    return {
      month,
      revenue,
      expenses,
      profit,
      isProjected: true
    };
  });
};

export function EnhancedFinancialChart() {
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState<FinancialData[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessType, setBusinessType] = useState<string>('');
  const [hasRealData, setHasRealData] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchFinancialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile to get business type
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setBusinessType(profileData.profile.business_type || '');
      }

      // Fetch financial insights data
      try {
        const financialResponse = await fetch('/api/financial-insights');
        if (financialResponse.ok) {
          const financialData = await financialResponse.json();
          
          if (financialData.length > 0) {
            // Process real data
            const processedData = processRealFinancialData(financialData);
            setHasRealData(true);
            setChartData(processedData);
          } else {
            // Generate projected data
            const projectedData = generateProjectedData(businessType);
            setHasRealData(false);
            setChartData(projectedData);
          }
        } else {
          // Fallback to projected data
          const projectedData = generateProjectedData(businessType);
          setHasRealData(false);
          setChartData(projectedData);
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
        // Fallback to projected data
        const projectedData = generateProjectedData(businessType);
        setHasRealData(false);
        setChartData(projectedData);
      }

      // Calculate summary
      calculateSummary();
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Fallback to projected data
      const projectedData = generateProjectedData(businessType);
      setChartData(projectedData);
    } finally {
      setIsLoading(false);
    }
  };

  const processRealFinancialData = (data: Array<{
    revenue?: number;
    expenses?: number;
    [key: string]: unknown;
  }>): FinancialData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    
    return months.map((month, index) => {
      // For real data, we might need to aggregate or interpolate
      // This is a simplified version - you might want more sophisticated logic
      const record = data[index] || data[0]; // Use available data
      const revenue = record?.revenue || 0;
      const expenses = record?.expenses || 0;
      const profit = revenue - expenses;
      
      return {
        month,
        revenue: revenue / 1000000, // Convert to millions for display
        expenses: expenses / 1000000,
        profit: profit / 1000000,
        isReal: true
      };
    });
  };

  const calculateSummary = () => {
    if (chartData.length === 0) return;
    
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    
    const revenues = chartData.map(item => item.revenue);
    const avgGrowth = revenues.length > 1 
      ? ((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 100
      : 0;
      
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    setSummary({
      totalRevenue,
      totalExpenses,
      totalProfit,
      avgGrowth,
      profitMargin
    });
  };

  if (!isClient || isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number, suffix = 'M') => {
    return `${value.toFixed(1)}${suffix}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ringkasan Keuangan
              {hasRealData ? (
                <Badge variant="default" className="text-xs">Data Real</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Proyeksi</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {hasRealData 
                ? "Berdasarkan data finansial Anda - 6 Bulan Terakhir"
                : `Proyeksi berdasarkan industri ${businessType || 'umum'} - 6 Bulan`
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button variant="outline" size="sm" onClick={fetchFinancialData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {formatNumber(summary.totalRevenue)}
              </div>
              <div className="text-xs text-green-600/70">Total Pendapatan</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {formatNumber(summary.totalExpenses)}
              </div>
              <div className="text-xs text-red-600/70">Total Pengeluaran</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(summary.totalProfit)}
                </div>
                {summary.avgGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : summary.avgGrowth < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="text-xs text-blue-600/70">Keuntungan Bersih</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {summary.profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600/70">Margin Keuntungan</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${value}M`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [formatNumber(value as number), name]}
                />} 
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${value}M`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [formatNumber(value as number), name]}
                />} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-revenue)" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="var(--color-expenses)" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="var(--color-profit)" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ChartContainer>
        
        {!hasRealData && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              💡 <strong>Tips:</strong> Data ini adalah proyeksi berdasarkan industri {businessType || 'umum'}. 
              Untuk melihat data real, lengkapi informasi keuangan di halaman <strong>Financial Summary</strong>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}