"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BusinessMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  marketShare: number;
  customerSatisfaction: number;
  employeeMotivation: number;
  riskLevel: number;
}

interface ScenarioEvent {
  id: string;
  title: string;
  description: string;
  type: 'market' | 'competitor' | 'economic' | 'internal';
  impact: 'high' | 'medium' | 'low';
  choices: ScenarioChoice[];
}

interface ScenarioChoice {
  id: string;
  text: string;
  description: string;
  cost: number;
  expectedOutcome: {
    revenue: number;
    expenses: number;
    marketShare: number;
    customerSatisfaction: number;
    employeeMotivation: number;
    riskLevel: number;
  };
}

interface SimulationState {
  quarter: number;
  year: number;
  cash: number;
  metrics: BusinessMetrics;
  history: BusinessMetrics[];
  currentEvent: ScenarioEvent | null;
  isRunning: boolean;
  gameOver: boolean;
  score: number;
}

export default function BusinessSimulatorPage() {
  const [businessType, setBusinessType] = useState('');
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializeSimulation = async () => {
    if (!businessType.trim()) {
      toast({
        variant: 'destructive',
        title: 'Business Type Required',
        description: 'Please specify your business type first.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/business-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'initialize',
          businessType 
        })
      });

      if (!response.ok) throw new Error('Failed to initialize simulation');
      
      const initialState = await response.json();
      setSimulation(initialState);
      
      toast({
        title: 'Simulation Started!',
        description: `Welcome to your ${businessType} business adventure!`
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to Start Simulation',
        description: 'Please try again later.'
      });
    }
    setIsLoading(false);
  };

  const makeDecision = async (choiceId: string) => {
    if (!simulation) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/business-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decision',
          simulationState: simulation,
          choiceId
        })
      });

      if (!response.ok) throw new Error('Failed to process decision');
      
      const newState = await response.json();
      setSimulation(newState);

      if (newState.gameOver) {
        toast({
          title: newState.cash < 0 ? 'Game Over!' : 'Congratulations!',
          description: newState.cash < 0 
            ? 'Your business ran out of cash.' 
            : `Final Score: ${newState.score}`,
          variant: newState.cash < 0 ? 'destructive' : 'default'
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Decision Failed',
        description: 'Failed to process your decision.'
      });
    }
    setIsLoading(false);
  };

  const advanceTime = async () => {
    if (!simulation || simulation.gameOver) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/business-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'advance',
          simulationState: simulation
        })
      });

      if (!response.ok) throw new Error('Failed to advance time');
      
      const newState = await response.json();
      setSimulation(newState);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Time Advance Failed',
        description: 'Failed to advance to next quarter.'
      });
    }
    setIsLoading(false);
  };

  const resetSimulation = () => {
    setSimulation(null);
    setBusinessType('');
  };


  const getMetricTrend = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (!simulation) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline flex items-center">
            <Target className="mr-3 h-8 w-8 text-primary" />
            Simulator Skenario Bisnis AI
          </h1>
          <p className="text-muted-foreground">
            Rasakan tantangan bisnis yang realistis dan uji kemampuan pengambilan keputusan Anda di lingkungan yang aman.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Mulai Perjalanan Bisnis Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="contoh: Kedai Kopi, Startup Teknologi, Toko Online"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
            <Button 
              onClick={initializeSimulation}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>Memuat Simulasi...</>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Simulasi
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const previousMetrics = simulation.history[simulation.history.length - 2] || simulation.metrics;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline flex items-center">
            <Target className="mr-3 h-8 w-8 text-primary" />
            Simulator Bisnis
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={advanceTime} disabled={isLoading || !!simulation.currentEvent}>
              Kuartal Berikutnya
            </Button>
            <Button variant="outline" size="sm" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">Q{simulation.quarter} {simulation.year}</Badge>
          <Badge variant="default">Score: {simulation.score}</Badge>
          {simulation.gameOver && <Badge variant="destructive">Game Over</Badge>}
        </div>
      </div>

      {/* Financial Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posisi Kas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${simulation.cash < 0 ? 'text-red-600' : 'text-green-600'}`}>
              Rp {simulation.cash.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Bulanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Rp {simulation.metrics.revenue.toLocaleString('id-ID')}</div>
              {getMetricTrend(simulation.metrics.revenue, previousMetrics.revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pangsa Pasar</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{simulation.metrics.marketShare.toFixed(2)}%</div>
              {getMetricTrend(simulation.metrics.marketShare, previousMetrics.marketShare)}
            </div>
            <Progress value={simulation.metrics.marketShare} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Risiko</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${simulation.metrics.riskLevel > 70 ? 'text-red-600' : 'text-yellow-600'}`}>
                {simulation.metrics.riskLevel.toFixed(2)}%
              </div>
            </div>
            <Progress value={simulation.metrics.riskLevel} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kepuasan Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{simulation.metrics.customerSatisfaction.toFixed(2)}%</span>
                {getMetricTrend(simulation.metrics.customerSatisfaction, previousMetrics.customerSatisfaction)}
              </div>
              <Progress value={simulation.metrics.customerSatisfaction} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Motivasi Karyawan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{simulation.metrics.employeeMotivation.toFixed(2)}%</span>
                {getMetricTrend(simulation.metrics.employeeMotivation, previousMetrics.employeeMotivation)}
              </div>
              <Progress value={simulation.metrics.employeeMotivation} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Margin Keuntungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${simulation.metrics.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {((simulation.metrics.profit / simulation.metrics.revenue) * 100).toFixed(1)}%
                </span>
                {getMetricTrend(simulation.metrics.profit, previousMetrics.profit)}
              </div>
              <div className="text-sm text-muted-foreground">
                Rp {simulation.metrics.profit.toLocaleString('id-ID')} keuntungan
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Scenario Event */}
      {simulation.currentEvent && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {simulation.currentEvent.title}
              </CardTitle>
              <Badge variant={
                simulation.currentEvent.impact === 'high' ? 'destructive' : 
                simulation.currentEvent.impact === 'medium' ? 'default' : 'secondary'
              }>
                {simulation.currentEvent.impact} impact
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{simulation.currentEvent.description}</p>
            
            <div className="space-y-3">
              <h4 className="font-medium">Choose your response:</h4>
              {simulation.currentEvent.choices.map((choice) => (
                <Card key={choice.id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{choice.text}</h5>
                    <Badge variant="outline">
                      Biaya: Rp {choice.cost.toLocaleString('id-ID')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{choice.description}</p>
                  <Button 
                    onClick={() => makeDecision(choice.id)}
                    disabled={isLoading || simulation.cash < choice.cost}
                    size="sm"
                    className="w-full"
                  >
                    {simulation.cash < choice.cost ? 'Insufficient Cash' : 'Choose This Option'}
                  </Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}