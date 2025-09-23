"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";

import {
  generateInitialBusinessPlan,
  GenerateInitialBusinessPlanOutput,
} from "@/ai/flows/generate-initial-business-plan";
import {
  getPersonalizedFinancialInsights,
  FinancialInsightsOutput,
} from "@/ai/flows/get-personalized-financial-insights";
import { 
  Loader2, 
  Save, 
  History, 
  Eye, 
  FileText, 
  Activity,
  TrendingUp, 
  TrendingDown, 
  Globe, 
  DollarSign, 
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

const businessPlanSchema = z.object({
  prompt: z.string().min(10, "Deskripsi ide bisnis minimal 10 karakter."),
});

const financialInsightsSchema = z.object({
  revenue: z.coerce.number().min(0, "Pendapatan harus positif."),
  expenses: z.coerce.number().min(0, "Pengeluaran harus positif."),
  assets: z.coerce.number().min(0, "Aset harus positif."),
  liabilities: z.coerce.number().min(0, "Kewajiban harus positif."),
  marketTrends: z.string().min(10, "Deskripsi tren pasar minimal 10 karakter."),
  businessGoals: z
    .string()
    .min(10, "Deskripsi tujuan bisnis minimal 10 karakter."),
});

// Saved data types with database field names
type SavedBusinessPlan = GenerateInitialBusinessPlanOutput & {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: 'draft' | 'final';
  executive_summary: string;
  company_description: string;
  products_services: string;
  market_analysis: string;
  marketing_strategy: string;
  management_team: string;
  financial_plan: string;
};

type SavedFinancialInsight = FinancialInsightsOutput & {
  id: string;
  revenue: number;
  expenses: number;
  assets: number;
  liabilities: number;
  market_trends: string;
  business_goals: string;
  created_at: string;
  cash_flow_analysis: string;
  profitability_analysis: string;
  investment_opportunities: string;
};

// Market Intelligence Types
interface MarketInsight {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  timestamp: string;
  actionable: string[];
}

interface MarketMetrics {
  usdIdr: {
    rate: number;
    change: number;
    trend: 'up' | 'down';
  };
  stockIndex: {
    value: number;
    change: number;
    trend: 'up' | 'down';
  };
  inflation: {
    rate: number;
    change: number;
  };
  interests: {
    rate: number;
    change: number;
  };
}

interface CompetitorIntel {
  company: string;
  news: string;
  impact: string;
  opportunity: string;
  threat: string;
}

export default function AssistantPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [planResult, setPlanResult] =
    useState<GenerateInitialBusinessPlanOutput | null>(null);
  const [insightsResult, setInsightsResult] =
    useState<FinancialInsightsOutput | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedBusinessPlan[]>([]);
  const [savedInsights, setSavedInsights] = useState<SavedFinancialInsight[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [viewPlanDialogOpen, setViewPlanDialogOpen] = useState(false);
  const [viewInsightDialogOpen, setViewInsightDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavedBusinessPlan | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<SavedFinancialInsight | null>(null);
  
  // Market Intelligence State
  const [industry, setIndustry] = useState('');
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics | null>(null);
  const [competitorIntel, setCompetitorIntel] = useState<CompetitorIntel[]>([]);
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const planForm = useForm<z.infer<typeof businessPlanSchema>>({
    resolver: zodResolver(businessPlanSchema),
    defaultValues: { prompt: "" },
  });

  const insightsForm = useForm<z.infer<typeof financialInsightsSchema>>({
    resolver: zodResolver(financialInsightsSchema),
    defaultValues: {
      revenue: 0,
      expenses: 0,
      assets: 0,
      liabilities: 0,
      marketTrends: "",
      businessGoals: "",
    },
  });

  const loadSavedData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const [plansResponse, insightsResponse] = await Promise.all([
        fetch('/api/business-plans'),
        fetch('/api/financial-insights')
      ]);
      
      const plansData = plansResponse.ok ? await plansResponse.json() : [];
      const insightsData = insightsResponse.ok ? await insightsResponse.json() : [];
      
      setSavedPlans(plansData || []);
      setSavedInsights(insightsData || []);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, [user?.id]);

  // Load saved data on component mount
  React.useEffect(() => {
    if (user?.id) {
      loadSavedData();
    }
  }, [user?.id, loadSavedData]);

  async function onPlanSubmit(values: z.infer<typeof businessPlanSchema>) {
    setIsPlanLoading(true);
    setPlanResult(null);
    try {
      const result = await generateInitialBusinessPlan(values);
      setPlanResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi Kesalahan",
        description: "Gagal membuat rencana bisnis. Silakan coba lagi.",
      });
      console.error(error);
    }
    setIsPlanLoading(false);
  }

  async function savePlan(title: string) {
    if (!user?.id || !planResult) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/business-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: planForm.getValues().prompt,
          executive_summary: planResult.executiveSummary,
          company_description: planResult.companyDescription,
          products_services: planResult.productsAndServices,
          market_analysis: planResult.marketAnalysis,
          marketing_strategy: planResult.marketingAndSalesStrategy,
          management_team: planResult.managementTeam,
          financial_plan: planResult.financialPlan,
          appendix: planResult.appendix,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save business plan');
      }

      toast({
        title: "Rencana Bisnis Disimpan",
        description: `Rencana "${title}" berhasil disimpan.`,
      });

      // Reload saved data
      loadSavedData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Gagal menyimpan rencana bisnis. Silakan coba lagi.",
      });
      console.error(error);
    }
    setIsSaving(false);
  }

  const handleSavePlan = async () => {
    if (!planTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Judul Diperlukan",
        description: "Silakan masukkan judul untuk rencana bisnis.",
      });
      return;
    }

    await savePlan(planTitle.trim());
    setSaveDialogOpen(false);
    setPlanTitle('');
  };

  async function onInsightsSubmit(
    values: z.infer<typeof financialInsightsSchema>
  ) {
    setIsInsightsLoading(true);
    setInsightsResult(null);
    try {
      const result = await getPersonalizedFinancialInsights(values);
      setInsightsResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi Kesalahan",
        description: "Gagal mendapatkan wawasan finansial. Silakan coba lagi.",
      });
      console.error(error);
    }
    setIsInsightsLoading(false);
  }

  async function saveInsight() {
    if (!user?.id || !insightsResult) return;

    setIsSaving(true);
    try {
      const formValues = insightsForm.getValues();
      const response = await fetch('/api/financial-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revenue: formValues.revenue,
          expenses: formValues.expenses,
          assets: formValues.assets,
          liabilities: formValues.liabilities,
          market_trends: formValues.marketTrends,
          business_goals: formValues.businessGoals,
          cash_flow_analysis: insightsResult.cashFlowAnalysis,
          profitability_analysis: insightsResult.profitabilityAnalysis,
          investment_opportunities: insightsResult.investmentOpportunities,
          recommendations: insightsResult.recommendations
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save financial insight');
      }

      toast({
        title: "Wawasan Finansial Disimpan",
        description: "Analisis finansial berhasil disimpan.",
      });

      // Reload saved data
      loadSavedData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Gagal menyimpan wawasan finansial. Silakan coba lagi.",
      });
      console.error(error);
    }
    setIsSaving(false);
  }

  const planSections = planResult ? [
    { title: "Executive Summary", content: planResult.executiveSummary },
    { title: "Company Description", content: planResult.companyDescription },
    { title: "Products and Services", content: planResult.productsAndServices },
    { title: "Market Analysis", content: planResult.marketAnalysis },
    { title: "Marketing and Sales Strategy", content: planResult.marketingAndSalesStrategy },
    { title: "Management Team", content: planResult.managementTeam },
    { title: "Financial Plan", content: planResult.financialPlan },
    { title: "Appendix", content: planResult.appendix },
  ] : [];

  const selectedPlanSections = selectedPlan ? [
    { title: "Executive Summary", content: selectedPlan.executive_summary },
    { title: "Company Description", content: selectedPlan.company_description },
    { title: "Products and Services", content: selectedPlan.products_services },
    { title: "Market Analysis", content: selectedPlan.market_analysis },
    { title: "Marketing and Sales Strategy", content: selectedPlan.marketing_strategy },
    { title: "Management Team", content: selectedPlan.management_team },
    { title: "Financial Plan", content: selectedPlan.financial_plan },
    { title: "Appendix", content: selectedPlan.appendix },
  ] : [];

  const handleViewPlan = (plan: SavedBusinessPlan) => {
    setSelectedPlan(plan);
    setViewPlanDialogOpen(true);
  };

  const handleViewInsight = (insight: SavedFinancialInsight) => {
    setSelectedInsight(insight);
    setViewInsightDialogOpen(true);
  };

  // Market Intelligence Functions
  const refreshMarketData = async () => {
    if (!industry.trim()) {
      toast({
        variant: 'destructive',
        title: 'Industry Required',
        description: 'Please specify your industry first.'
      });
      return;
    }

    setIsMarketLoading(true);
    try {
      const response = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry })
      });

      if (!response.ok) throw new Error('Failed to fetch market intelligence');
      
      const data = await response.json();
      setMarketInsights(data.insights);
      setMarketMetrics(data.metrics);
      setCompetitorIntel(data.competitors);
      setLastUpdate(new Date());
      
      toast({
        title: 'Market Data Updated',
        description: 'Latest market intelligence has been loaded.'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to Load Market Data',
        description: 'Please try again later.'
      });
    }
    setIsMarketLoading(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="default">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
       <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Asisten AI</h1>
        <p className="text-muted-foreground">
          Dapatkan bantuan cerdas untuk perencanaan dan analisis bisnis Anda.
        </p>
      </div>
      <Tabs defaultValue="business-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-plan">Rencana Bisnis</TabsTrigger>
          <TabsTrigger value="financial-insights">Wawasan Finansial</TabsTrigger>
          <TabsTrigger value="market-intelligence">Market Intelligence</TabsTrigger>
        </TabsList>
        <TabsContent value="business-plan">
          <Card>
            <CardHeader>
              <CardTitle>Generator Rencana Bisnis Awal</CardTitle>
              <CardDescription>
                Jelaskan ide bisnis Anda dan biarkan AI menyusun draf rencana
                bisnis untuk Anda.
              </CardDescription>
            </CardHeader>
            <Form {...planForm}>
              <form onSubmit={planForm.handleSubmit(onPlanSubmit)}>
                <CardContent>
                  <FormField
                    control={planForm.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Ide Bisnis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Kedai kopi modern di Jakarta Selatan dengan fokus pada biji kopi lokal Indonesia..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPlanLoading}>
                    {isPlanLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Buat Rencana Bisnis
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          {planResult && (
             <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Hasil Rencana Bisnis</CardTitle>
                    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Save className="mr-2 h-4 w-4" />
                          Simpan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Simpan Rencana Bisnis</DialogTitle>
                          <DialogDescription>
                            Berikan judul untuk rencana bisnis ini.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Contoh: Kedai Kopi Jakarta Selatan"
                            value={planTitle}
                            onChange={(e) => setPlanTitle(e.target.value)}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSaveDialogOpen(false)
                                setPlanTitle('')
                              }}
                            >
                              Batal
                            </Button>
                            <Button onClick={handleSavePlan} disabled={isSaving}>
                              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Simpan
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {planSections.map((section, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{section.title}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-sm max-w-none text-muted-foreground">
                                        <ReactMarkdown>{section.content}</ReactMarkdown>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
             </Card>
          )}
        </TabsContent>
        <TabsContent value="financial-insights">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Finansial Personal</CardTitle>
              <CardDescription>
                Masukkan data keuangan Anda untuk mendapatkan analisis dan
                rekomendasi dari AI.
              </CardDescription>
            </CardHeader>
            <Form {...insightsForm}>
              <form onSubmit={insightsForm.handleSubmit(onInsightsSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={insightsForm.control} name="revenue" render={({ field }) => (
                        <FormItem><FormLabel>Pendapatan (IDR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={insightsForm.control} name="expenses" render={({ field }) => (
                        <FormItem><FormLabel>Pengeluaran (IDR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={insightsForm.control} name="assets" render={({ field }) => (
                        <FormItem><FormLabel>Aset (IDR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={insightsForm.control} name="liabilities" render={({ field }) => (
                        <FormItem><FormLabel>Kewajiban (IDR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={insightsForm.control} name="marketTrends" render={({ field }) => (
                      <FormItem><FormLabel>Tren Pasar Saat Ini</FormLabel><FormControl><Textarea placeholder="Contoh: Meningkatnya permintaan untuk produk ramah lingkungan..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={insightsForm.control} name="businessGoals" render={({ field }) => (
                      <FormItem><FormLabel>Tujuan Bisnis Anda</FormLabel><FormControl><Textarea placeholder="Contoh: Meningkatkan penjualan online sebesar 20% dalam 6 bulan..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isInsightsLoading}>
                    {isInsightsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Dapatkan Wawasan
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
           {insightsResult && (
             <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Wawasan Finansial Anda</CardTitle>
                  <Button variant="outline" size="sm" onClick={saveInsight} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Analisis Arus Kas</h3>
                        <p className="text-sm text-muted-foreground">{insightsResult.cashFlowAnalysis}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Analisis Profitabilitas</h3>
                        <p className="text-sm text-muted-foreground">{insightsResult.profitabilityAnalysis}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">Peluang Investasi</h3>
                        <p className="text-sm text-muted-foreground">{insightsResult.investmentOpportunities}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">Rekomendasi</h3>
                        <p className="text-sm text-muted-foreground">{insightsResult.recommendations}</p>
                    </div>
                </CardContent>
             </Card>
          )}
        </TabsContent>
        <TabsContent value="market-intelligence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Market Intelligence
              </CardTitle>
              <CardDescription>
                Real-time market analysis dan competitive intelligence untuk strategic decision making.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., F&B, E-commerce, Fintech, Manufacturing"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={refreshMarketData} 
                  disabled={isMarketLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isMarketLoading ? 'animate-spin' : ''}`} />
                  {isMarketLoading ? 'Loading...' : 'Analyze Market'}
                </Button>
              </div>
              {lastUpdate && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString('id-ID')}
                </p>
              )}
            </CardContent>
          </Card>

          {marketInsights.length > 0 && (
            <Tabs defaultValue="insights" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">Market Insights</TabsTrigger>
                <TabsTrigger value="metrics">Economic Metrics</TabsTrigger>
                <TabsTrigger value="competitors">Competitor Intel</TabsTrigger>
              </TabsList>

              {/* Market Insights Tab */}
              <TabsContent value="insights" className="space-y-4 mt-4">
                {marketInsights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getImpactBadge(insight.impact)}
                          <div className={`flex items-center gap-1 ${getSentimentColor(insight.sentiment)}`}>
                            {insight.sentiment === 'positive' && <TrendingUp className="h-4 w-4" />}
                            {insight.sentiment === 'negative' && <TrendingDown className="h-4 w-4" />}
                            {insight.sentiment === 'neutral' && <Activity className="h-4 w-4" />}
                            <span className="text-sm capitalize">{insight.sentiment}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.source} • {new Date(insight.timestamp).toLocaleDateString('id-ID')}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{insight.summary}</p>
                      {insight.actionable.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Actionable Insights:
                          </div>
                          <ul className="space-y-1">
                            {insight.actionable.map((action, index) => (
                              <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Economic Metrics Tab */}
              <TabsContent value="metrics" className="space-y-4 mt-4">
                {marketMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">USD/IDR</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketMetrics.usdIdr.rate.toLocaleString()}</div>
                        <p className={`text-xs ${marketMetrics.usdIdr.trend === 'up' ? 'text-red-600' : 'text-green-600'} flex items-center gap-1`}>
                          {marketMetrics.usdIdr.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(marketMetrics.usdIdr.change)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">IHSG</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketMetrics.stockIndex.value.toLocaleString()}</div>
                        <p className={`text-xs ${marketMetrics.stockIndex.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                          {marketMetrics.stockIndex.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(marketMetrics.stockIndex.change)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Inflation</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketMetrics.inflation.rate}%</div>
                        <p className="text-xs text-muted-foreground">
                          {marketMetrics.inflation.change >= 0 ? '+' : ''}{marketMetrics.inflation.change}% MoM
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketMetrics.interests.rate}%</div>
                        <p className="text-xs text-muted-foreground">
                          {marketMetrics.interests.change >= 0 ? '+' : ''}{marketMetrics.interests.change}% QoQ
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Competitor Intelligence Tab */}
              <TabsContent value="competitors" className="space-y-4 mt-4">
                {competitorIntel.map((competitor, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        {competitor.company}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Latest News</h4>
                        <p className="text-sm text-muted-foreground">{competitor.news}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Business Impact</h4>
                        <p className="text-sm text-muted-foreground">{competitor.impact}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1 text-green-600">Opportunities</h4>
                          <p className="text-sm text-muted-foreground">{competitor.opportunity}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1 text-red-600">Threats</h4>
                          <p className="text-sm text-muted-foreground">{competitor.threat}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Saved Items Section */}
      {(savedPlans.length > 0 || savedInsights.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Item yang Tersimpan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="saved-plans" className="w-full">
              <TabsList>
                {savedPlans.length > 0 && (
                  <TabsTrigger value="saved-plans">
                    Rencana Bisnis ({savedPlans.length})
                  </TabsTrigger>
                )}
                {savedInsights.length > 0 && (
                  <TabsTrigger value="saved-insights">
                    Wawasan Finansial ({savedInsights.length})
                  </TabsTrigger>
                )}
              </TabsList>
              
              {savedPlans.length > 0 && (
                <TabsContent value="saved-plans">
                  <div className="space-y-2">
                    {savedPlans.map((plan) => (
                      <Card key={plan.id} className="p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{plan.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(plan.created_at).toLocaleDateString('id-ID')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {plan.description && plan.description.length > 100 
                                ? `${plan.description.substring(0, 100)}...` 
                                : plan.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-muted-foreground mr-2">
                              {plan.status === 'draft' ? 'Draft' : 'Final'}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewPlan(plan)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {savedInsights.length > 0 && (
                <TabsContent value="saved-insights">
                  <div className="space-y-2">
                    {savedInsights.map((insight) => (
                      <Card key={insight.id} className="p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              Analisis Finansial - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(insight.revenue || 0)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(insight.created_at).toLocaleDateString('id-ID')}
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">
                              <span>Pendapatan: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(insight.revenue || 0)} • </span>
                              <span>Pengeluaran: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(insight.expenses || 0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewInsight(insight)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Business Plan View Dialog */}
      <Dialog open={viewPlanDialogOpen} onOpenChange={setViewPlanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {selectedPlan?.title}
            </DialogTitle>
            <DialogDescription>
              Dibuat pada {selectedPlan ? new Date(selectedPlan.created_at).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : ''} • Status: {selectedPlan?.status === 'draft' ? 'Draft' : 'Final'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedPlan && (
              <Accordion type="single" collapsible className="w-full">
                {selectedPlanSections.map((section, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{section.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <ReactMarkdown>{section.content || 'Konten tidak tersedia'}</ReactMarkdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Financial Insight View Dialog */}
      <Dialog open={viewInsightDialogOpen} onOpenChange={setViewInsightDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Wawasan Finansial
            </DialogTitle>
            <DialogDescription>
              Dibuat pada {selectedInsight ? new Date(selectedInsight.created_at).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedInsight && (
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Ringkasan Keuangan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendapatan</p>
                      <p className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedInsight.revenue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pengeluaran</p>
                      <p className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedInsight.expenses || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aset</p>
                      <p className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedInsight.assets || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kewajiban</p>
                      <p className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedInsight.liabilities || 0)}</p>
                    </div>
                  </div>
                  
                  {selectedInsight.market_trends && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Tren Pasar</p>
                      <p className="text-sm">{selectedInsight.market_trends}</p>
                    </div>
                  )}
                  
                  {selectedInsight.business_goals && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Tujuan Bisnis</p>
                      <p className="text-sm">{selectedInsight.business_goals}</p>
                    </div>
                  )}
                </div>

                {/* Analysis Sections */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Analisis Arus Kas</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedInsight.cash_flow_analysis || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Analisis Profitabilitas</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedInsight.profitability_analysis || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Peluang Investasi</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedInsight.investment_opportunities || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Rekomendasi</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedInsight.recommendations || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
