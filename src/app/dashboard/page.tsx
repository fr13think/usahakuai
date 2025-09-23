"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Bot, FileText, MessageSquare, CheckSquare, DollarSign, Palette, Target, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FinancialChart } from "@/components/financial-chart";
import { useAuth } from "@/components/auth/auth-provider";

const quickLinks = [
    {
      title: "Asisten AI",
      description: "Rencana bisnis, analisis finansial, dan market intelligence.",
      href: "/dashboard/assistant",
      icon: <Bot className="h-8 w-8 text-primary" />,
      featured: true,
    },
    {
      title: "Brand Generator",
      description: "Buat identitas visual dengan AI.",
      href: "/dashboard/brand-generator",
      icon: <Palette className="h-8 w-8 text-primary" />,
      featured: true,
    },
    {
      title: "Business Simulator",
      description: "Simulasi bisnis interaktif.",
      href: "/dashboard/business-simulator",
      icon: <Target className="h-8 w-8 text-primary" />,
      featured: true,
    },
    {
      title: "Chat AI",
      description: "Konsultasi bisnis dengan AI.",
      href: "/dashboard/chat-ai",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      featured: false,
    },
    {
      title: "Analisis Dokumen",
      description: "Ringkas laporan keuangan atau izin.",
      href: "/dashboard/documents",
      icon: <FileText className="h-8 w-8 text-primary" />,
      featured: false,
    },
    {
      title: "Ringkasan Keuangan",
      description: "Lihat laporan keuangan bisnis.",
      href: "/dashboard/financial-summary",
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      featured: false,
    },
    {
      title: "Generator Konten",
      description: "Buat konten marketing otomatis.",
      href: "/dashboard/content-generator",
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      featured: false,
    },
    {
      title: "Manajemen Tugas",
      description: "Kelola tugas penting bisnis.",
      href: "/dashboard/tasks",
      icon: <CheckSquare className="h-8 w-8 text-primary" />,
      featured: false,
    },
  ];

export default function DashboardPage() {
  const { user } = useAuth();
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0, in_progress: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadTaskStats = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/tasks?type=stats');
        if (response.ok) {
          const stats = await response.json();
          setTaskStats(stats);
        }
      } catch (error) {
        console.error('Error loading task stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user?.id) {
      loadTaskStats();
    }
  }, [user?.id]);

  const progress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Selamat Datang, Pengusaha!</h1>
        <p className="text-muted-foreground">
          Mari kita bangun usahamu menjadi lebih besar bersama UsahaKu Navigator.
        </p>
      </div>

      {/* Featured New Features Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            🚀 Fitur AI Terbaru
          </CardTitle>
          <CardDescription>
            Jelajahi fitur-fitur AI terdepan yang baru saja diluncurkan untuk mengakselerasi bisnis Anda!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickLinks.filter(link => link.featured).map((link) => (
              <Card key={link.title} className="relative overflow-hidden border-primary/20 hover:shadow-lg transition-shadow">
                <div className="absolute top-2 right-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <Button asChild className="w-full">
                    <Link href={link.href}>
                      Coba Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Progres Bisnis Anda</CardTitle>
            <CardDescription>Selesaikan semua tugas untuk mengembangkan bisnis!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Tugas Selesai</span>
                    <span>
                      {isLoadingStats ? "Loading..." : `${taskStats.completed} dari ${taskStats.total} Selesai`}
                    </span>
                </div>
                <Progress value={isLoadingStats ? 0 : progress} aria-label={`${progress.toFixed(0)}% complete`} />
                {!isLoadingStats && (
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(0)}% tugas telah diselesaikan
                  </p>
                )}
            </div>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/tasks">Lihat Semua Tugas</Link>
            </Button>
          </CardContent>
        </Card>

        {quickLinks.filter(link => !link.featured).map((link) => (
            <Card key={link.title} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{link.title}</CardTitle>
                {link.icon}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </CardContent>
              <CardContent>
                 <Button asChild className="w-full">
                    <Link href={link.href}>
                        Mulai <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FinancialChart />
      </div>
    </div>
  );
}
