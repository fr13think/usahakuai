"use client";

import * as React from "react";
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { BarChart3, TrendingUp } from "lucide-react";

interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

interface ChartApiResponse {
  data: ChartDataPoint[];
  source: 'real' | 'insights' | 'simulation';
  lastUpdated: string | null;
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
} satisfies ChartConfig;

export function FinancialChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [dataSource, setDataSource] = React.useState<'real' | 'insights' | 'simulation'>('simulation');
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar');

  React.useEffect(() => {
    const fetchChartData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/financial-chart');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const result: ChartApiResponse = await response.json();
        setChartData(result.data);
        setDataSource(result.source);
        setLastUpdated(result.lastUpdated);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
        
        // Fallback to default data on error
        setChartData([
          { month: "Januari", revenue: 186, expenses: 80 },
          { month: "Februari", revenue: 305, expenses: 200 },
          { month: "Maret", revenue: 237, expenses: 120 },
          { month: "April", revenue: 173, expenses: 190 },
          { month: "Mei", revenue: 209, expenses: 130 },
          { month: "Juni", revenue: 214, expenses: 140 },
        ]);
        setDataSource('simulation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [user?.id]);

  const getSourceBadgeVariant = () => {
    switch (dataSource) {
      case 'real': return 'default';
      case 'insights': return 'secondary';
      case 'simulation': return 'outline';
      default: return 'outline';
    }
  };

  const getSourceLabel = () => {
    switch (dataSource) {
      case 'real': return 'Data Real';
      case 'insights': return 'Data Manual';
      case 'simulation': return 'Simulasi';
      default: return 'Simulasi';
    }
  };

  const getDescription = () => {
    if (dataSource === 'real' && lastUpdated) {
      const date = new Date(lastUpdated).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      });
      return `Data dari analisis keuangan terakhir (${date})`;
    } else if (dataSource === 'insights') {
      return 'Berdasarkan data keuangan yang Anda input';
    } else {
      return 'Simulasi berdasarkan profil bisnis Anda';
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ringkasan Keuangan
              <Badge variant={getSourceBadgeVariant()} className="text-xs">
                {getSourceLabel()}
              </Badge>
            </CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-muted p-1">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-7 px-2"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Bar
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-7 px-2"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Line
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            ⚠️ {error}
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
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-revenue)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="var(--color-expenses)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-expenses)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ChartContainer>
        {dataSource === 'simulation' && (
          <div className="mt-4 text-xs text-muted-foreground border-t pt-3">
            💡 <strong>Tips:</strong> Upload laporan keuangan di halaman <em>Analisis Dokumen</em> atau input data manual di <em>Ringkasan Keuangan</em> untuk melihat grafik dengan data real Anda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
