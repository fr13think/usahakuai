"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, TrendingUp, FileText, AlertTriangle, Target } from "lucide-react";
import { MarketIntelligenceDisplay } from "@/components/business-advice/market-intelligence-display";
import { BusinessRecommendations } from "@/components/business-advice/business-recommendations";
import { type MarketIntelligence } from "@/lib/exa-api";

// Predefined industry options
const industries = [
  { value: "food-beverage", label: "Makanan & Minuman" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "technology", label: "Teknologi" },
  { value: "healthcare", label: "Kesehatan" },
  { value: "education", label: "Pendidikan" },
  { value: "finance", label: "Finansial & Fintech" },
  { value: "manufacturing", label: "Manufaktur" },
  { value: "transportation", label: "Transportasi & Logistik" },
  { value: "agriculture", label: "Pertanian" },
  { value: "tourism", label: "Pariwisata" },
  { value: "fashion", label: "Fashion & Tekstil" },
  { value: "property", label: "Properti & Real Estate" },
  { value: "energy", label: "Energi & Lingkungan" },
  { value: "media", label: "Media & Hiburan" },
  { value: "consulting", label: "Konsultasi & Layanan Profesional" },
  { value: "custom", label: "Lainnya (Input Manual)" },
];

interface BusinessAdviceData {
  marketIntelligence: MarketIntelligence;
  recommendations: {
    quickWins: string[];
    longTermStrategy: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  summary: string;
}

export default function BusinessAdvicePage() {
  const [businessType, setBusinessType] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [adviceData, setAdviceData] = useState<BusinessAdviceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessType.trim()) {
      setError("Mohon masukkan jenis bisnis");
      return;
    }

    if (!selectedIndustry) {
      setError("Mohon pilih industri");
      return;
    }

    if (selectedIndustry === "custom" && !customIndustry.trim()) {
      setError("Mohon masukkan nama industri");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const industry = selectedIndustry === "custom" ? customIndustry : 
                      industries.find(i => i.value === selectedIndustry)?.label || selectedIndustry;

      const response = await fetch("/api/business-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: businessType.trim(),
          industry: industry,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (response.status === 422) {
        // Handle case where no market intelligence data found
        setError(data.error || "Data pasar tidak ditemukan untuk query ini.");
        setAdviceData(null);
      } else {
        setAdviceData(data);
      }
    } catch (err) {
      console.error("Failed to get business advice:", err);
      setError("Gagal mendapatkan saran bisnis. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBusinessType("");
    setSelectedIndustry("");
    setCustomIndustry("");
    setAdviceData(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Saran Bisnis</h1>
          <p className="text-muted-foreground">
            Dapatkan insight pasar real-time dan rekomendasi strategis untuk bisnis Anda
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analisis Bisnis Anda
          </CardTitle>
          <CardDescription>
            Masukkan informasi bisnis untuk mendapatkan saran yang dipersonalisasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-type">Jenis Bisnis *</Label>
                <Input
                  id="business-type"
                  placeholder="Contoh: Kedai kopi specialty, Toko online fashion, Aplikasi fintech"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industri *</Label>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={setSelectedIndustry}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih industri..." />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedIndustry === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-industry">Nama Industri</Label>
                <Input
                  id="custom-industry"
                  placeholder="Masukkan nama industri..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Dapatkan Saran Bisnis
                  </>
                )}
              </Button>
              
              {adviceData && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Analisis Baru
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Display */}
      {adviceData && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ringkasan Eksekutif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {adviceData.summary || "Sedang menganalisis data pasar untuk memberikan ringkasan yang komprehensif..."}
              </p>
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs defaultValue="intelligence" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="intelligence" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Market Intelligence</span>
                <span className="sm:hidden">Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Rekomendasi</span>
                <span className="sm:hidden">Saran</span>
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Peluang</span>
                <span className="sm:hidden">Peluang</span>
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Risiko</span>
                <span className="sm:hidden">Risiko</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="intelligence">
              <MarketIntelligenceDisplay 
                marketIntelligence={adviceData.marketIntelligence} 
              />
            </TabsContent>

            <TabsContent value="recommendations">
              <BusinessRecommendations 
                recommendations={adviceData.recommendations}
                type="strategy"
              />
            </TabsContent>

            <TabsContent value="opportunities">
              <BusinessRecommendations 
                recommendations={adviceData.recommendations}
                type="opportunities"
              />
            </TabsContent>

            <TabsContent value="risks">
              <BusinessRecommendations 
                recommendations={adviceData.recommendations}
                type="risks"
              />
            </TabsContent>
          </Tabs>

          {/* Metadata */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  Diperbarui: {new Date(adviceData.marketIntelligence.lastUpdated).toLocaleString('id-ID')}
                </Badge>
                <Badge variant="outline">
                  Query: {adviceData.marketIntelligence.query}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}