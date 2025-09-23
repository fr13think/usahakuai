"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

interface BusinessRecommendationsProps {
  recommendations: {
    quickWins: string[];
    longTermStrategy: string[];
    riskFactors: string[];
    opportunities: string[];
  };
  type: "strategy" | "opportunities" | "risks";
}

function RecommendationItem({ 
  item, 
  icon: Icon, 
  variant = "default" 
}: { 
  item: string; 
  icon: React.ComponentType<{ className?: string; }>;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const getBadgeVariant = () => {
    switch (variant) {
      case "success": return "default";
      case "warning": return "secondary";
      case "destructive": return "destructive";
      default: return "outline";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "success": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "destructive": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed">{item}</p>
      </div>
      <Badge variant={getBadgeVariant()} className="ml-2">
        {variant === "success" && "Quick Win"}
        {variant === "warning" && "Long Term"}
        {variant === "destructive" && "Risk"}
        {variant === "default" && "Opportunity"}
      </Badge>
    </div>
  );
}

function RecommendationSection({
  title,
  description,
  items,
  icon: Icon,
  variant,
  emptyMessage
}: {
  title: string;
  description: string;
  items: string[];
  icon: React.ComponentType<{ className?: string; }>;
  variant: "success" | "warning" | "destructive" | "default";
  emptyMessage: string;
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
        {items.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <RecommendationItem
                  key={index}
                  item={item}
                  icon={Icon}
                  variant={variant}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BusinessRecommendations({ recommendations, type }: BusinessRecommendationsProps) {
  if (type === "strategy") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecommendationSection
          title="Quick Wins"
          description="Strategi yang dapat diimplementasikan dalam waktu dekat dengan effort minimal"
          items={recommendations.quickWins}
          icon={Zap}
          variant="success"
          emptyMessage="Belum ada rekomendasi quick wins yang tersedia"
        />
        
        <RecommendationSection
          title="Strategi Jangka Panjang"
          description="Rencana strategis untuk pertumbuhan dan pengembangan bisnis berkelanjutan"
          items={recommendations.longTermStrategy}
          icon={TrendingUp}
          variant="warning"
          emptyMessage="Belum ada rekomendasi strategi jangka panjang yang tersedia"
        />
      </div>
    );
  }

  if (type === "opportunities") {
    return (
      <RecommendationSection
        title="Peluang Bisnis"
        description="Peluang pasar dan area ekspansi yang potensial untuk dikembangkan"
        items={recommendations.opportunities}
        icon={Target}
        variant="default"
        emptyMessage="Belum ada peluang bisnis yang teridentifikasi"
      />
    );
  }

  if (type === "risks") {
    return (
      <RecommendationSection
        title="Faktor Risiko"
        description="Potensi risiko dan tantangan yang perlu diantisipasi dan dimitigasi"
        items={recommendations.riskFactors}
        icon={Shield}
        variant="destructive"
        emptyMessage="Belum ada faktor risiko yang teridentifikasi"
      />
    );
  }

  return null;
}