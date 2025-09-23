"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, TrendingUp, User, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-gray-900/80 dark:via-gray-900/20" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Platform AI #1 untuk UKM Indonesia
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Kembangkan Bisnis UKM dengan
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Masa Depan</span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl lg:max-w-none">
              Chat dengan AI spesialis bisnis, analisis dokumen cerdas, voice recognition dalam Bahasa Indonesia, 
              dan lebih dari 10+ tools AI powerful. Semua dalam satu platform yang dirancang khusus untuk pengusaha Indonesia.
            </p>
            
            {/* Key Benefits */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Tingkatkan omzet hingga 3x</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Hemat waktu 80% dalam planning</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    >
                      Mulai Gratis Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="group"
                    >
                      <LogIn className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Masuk ke Akun
                    </Button>
                  </Link>
                </>
              )}
              
              {user && (
                <Button variant="outline" size="lg" className="group">
                  <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Lihat Demo (2 menit)
                </Button>
              )}
            </div>
            
            {/* Social Proof */}
            <div className="mt-12 text-center lg:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Dipercaya oleh 1000+ pengusaha Indonesia
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">UMKM</div>
                <div className="text-2xl font-bold text-gray-400">Startup</div>
                <div className="text-2xl font-bold text-gray-400">SME</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Dashboard Preview */}
              <div className="relative rounded-2xl bg-white shadow-2xl dark:bg-gray-800 p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Dashboard UsahaKu AI</h3>
                    <div className="bg-white/20 rounded-full p-1">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded p-2">
                      <div className="text-sm opacity-80">Chat AI Specialist</div>
                      <div className="font-semibold">5 AI Agents Ready 🤖</div>
                    </div>
                    <div className="bg-white/10 rounded p-2">
                      <div className="text-sm opacity-80">Voice Recognition</div>
                      <div className="font-semibold">Bahasa Indonesia 🎤</div>
                    </div>
                    <div className="bg-white/10 rounded p-2">
                      <div className="text-sm opacity-80">Document Analysis</div>
                      <div className="font-semibold">RAG System Active 📄</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-32">
                <div className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</div>
                <div className="text-sm font-semibold text-green-600">Online 24/7</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-36">
                <div className="text-xs text-gray-500 dark:text-gray-400">Pengguna Aktif</div>
                <div className="text-sm font-semibold text-blue-600">1,000+ UKM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}