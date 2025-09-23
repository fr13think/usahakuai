"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Users, 
  Newspaper, 
  FileText, 
  Target,
  ExternalLink,
  Calendar,
  Star
} from "lucide-react";
import { type MarketIntelligence, type ExaSearchResult } from "@/lib/exa-api";

interface MarketIntelligenceDisplayProps {
  marketIntelligence: MarketIntelligence;
}

function SearchResultCard({ result, icon: Icon }: { result: ExaSearchResult; icon: React.ComponentType<{ className?: string; }>; }) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-2">
              {result.title}
            </h4>
            
            {result.summary && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                {result.summary}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {result.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(result.publishedDate).toLocaleDateString('id-ID')}
                </div>
              )}
              {result.score && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {Math.round(result.score * 100)}%
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => window.open(result.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Baca Selengkapnya
            </Button>
          </div>
          
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function SearchResultSection({ 
  title, 
  results, 
  icon: Icon,
  description 
}: { 
  title: string; 
  results: ExaSearchResult[];
  icon: React.ComponentType<{ className?: string; }>;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            {results.map((result) => (
              <SearchResultCard 
                key={result.id} 
                result={result} 
                icon={Icon}
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
            <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">Tidak ada data ditemukan</p>
            <p className="text-xs opacity-60">Data {title.toLowerCase()} tidak tersedia untuk query ini</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MarketIntelligenceDisplay({ marketIntelligence }: MarketIntelligenceDisplayProps) {
  const totalResults = 
    marketIntelligence.marketTrends.length +
    marketIntelligence.competitorAnalysis.length +
    marketIntelligence.industryNews.length +
    marketIntelligence.regulations.length +
    marketIntelligence.opportunities.length;

  if (totalResults === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingUp className="h-5 w-5" />
              Market Intelligence - Data Tidak Ditemukan
            </CardTitle>
            <CardDescription>
              Tidak ada data pasar yang ditemukan untuk: <strong>{marketIntelligence.query}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Data Market Intelligence Tidak Tersedia</h3>
              <p className="text-sm mb-4 max-w-md mx-auto">
                Sistem tidak dapat menemukan informasi pasar untuk query &quot;{marketIntelligence.query}&quot;. 
                Ini mungkin karena:
              </p>
              <ul className="text-xs text-left max-w-sm mx-auto space-y-1 bg-gray-50 p-4 rounded-lg">
                <li>• Query terlalu spesifik atau tidak umum</li>
                <li>• Data untuk industri ini belum tersedia</li>
                <li>• Koneksi ke sumber data bermasalah</li>
                <li>• Jenis bisnis tidak terdeteksi dengan baik</li>
              </ul>
              <p className="text-xs mt-4 text-gray-500">
                💡 <strong>Saran:</strong> Coba gunakan kata kunci yang lebih umum atau pilih industri yang berbeda
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overview Market Intelligence
          </CardTitle>
          <CardDescription>
            Ringkasan data pasar yang berhasil dikumpulkan untuk: <strong>{marketIntelligence.query}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {marketIntelligence.marketTrends.length}
              </div>
              <div className="text-xs text-muted-foreground">Tren Pasar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {marketIntelligence.competitorAnalysis.length}
              </div>
              <div className="text-xs text-muted-foreground">Analisis Kompetitor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {marketIntelligence.industryNews.length}
              </div>
              <div className="text-xs text-muted-foreground">Berita Industri</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {marketIntelligence.regulations.length}
              </div>
              <div className="text-xs text-muted-foreground">Regulasi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {marketIntelligence.opportunities.length}
              </div>
              <div className="text-xs text-muted-foreground">Peluang</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total data ditemukan: <strong>{totalResults}</strong></span>
            <span>
              Terakhir diperbarui: {new Date(marketIntelligence.lastUpdated).toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Market Intelligence Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchResultSection
          title="Tren Pasar"
          results={marketIntelligence.marketTrends}
          icon={TrendingUp}
          description="Tren dan perkembangan terkini di pasar Indonesia"
        />
        
        <SearchResultSection
          title="Analisis Kompetitor"
          results={marketIntelligence.competitorAnalysis}
          icon={Users}
          description="Informasi tentang kompetitor dan strategi persaingan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchResultSection
          title="Berita Industri"
          results={marketIntelligence.industryNews}
          icon={Newspaper}
          description="Update terbaru dari industri dan perkembangan bisnis"
        />
        
        <SearchResultSection
          title="Regulasi & Kebijakan"
          results={marketIntelligence.regulations}
          icon={FileText}
          description="Peraturan pemerintah dan kebijakan yang mempengaruhi bisnis"
        />
      </div>

      <SearchResultSection
        title="Peluang Bisnis"
        results={marketIntelligence.opportunities}
        icon={Target}
        description="Peluang investasi dan ekspansi bisnis yang potensial"
      />
    </div>
  );
}