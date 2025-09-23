"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  Brain, 
  TrendingUp, 
  Megaphone, 
  CheckSquare, 
  ArrowRight,
  Zap,
  Shield,
  Clock,
  MessageCircle,
  Mic,
  FileText,
  Bot,
  Users,
  Star,
  Rocket,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Chat AI Multi-Specialist",
    description: "Konsultasi dengan 5 AI specialist bisnis: Strategi, Keuangan, Pasar, Risiko, dan Pembelajaran. Voice recognition dalam Bahasa Indonesia dengan RAG system untuk analisis dokumen.",
    benefits: ["5 AI Agents spesialis", "Voice recognition Indonesia", "Text-to-speech output", "RAG document analysis"],
    color: "from-indigo-500 to-purple-600",
    stats: "AI ter-advanced",
    tag: "Fitur Utama"
  },
  {
    icon: Brain,
    title: "Rencana Bisnis AI",
    description: "AI menganalisis ide bisnis Anda dan menyusun rencana bisnis lengkap dengan strategi, analisis pasar, dan proyeksi finansial.",
    benefits: ["Executive Summary otomatis", "Analisis kompetitor mendalam", "Proyeksi keuangan 3 tahun", "Template siap pakai"],
    color: "from-blue-500 to-blue-600",
    stats: "95% akurasi prediksi",
    tag: "Fitur Utama"
  },
  {
    icon: TrendingUp,
    title: "Business Simulator",
    description: "Simulasikan skenario bisnis dengan AI dan lihat proyeksi keuangan real-time. Bandingkan berbagai strategi untuk mengoptimalkan pertumbuhan dan profitabilitas.",
    benefits: ["What-if analysis", "Stress testing finansial", "Multiple scenario comparison", "Growth optimization"],
    color: "from-cyan-500 to-blue-600",
    stats: "Prediksi >90% akurat",
    tag: "Baru"
  },
  {
    icon: FileText,
    title: "Analisis Dokumen AI",
    description: "Upload dokumen bisnis apapun dan dapatkan ringkasan, insight, dan rekomendasi otomatis. Mendukung PDF, gambar, dan berbagai format file.",
    benefits: ["OCR & Vision AI", "Smart summarization", "Key insights extraction", "Multi-format support"],
    color: "from-green-500 to-green-600",
    stats: "Hemat 5+ jam analisis",
    tag: "Fitur Utama"
  },
  {
    icon: Megaphone,
    title: "Generator Konten Marketing",
    description: "Foto produk jadi konten marketing viral! AI menganalisis gambar dan menghasilkan caption, hashtag, dan copy yang menarik untuk platform sosial media.",
    benefits: ["Analisis visual AI", "Caption Instagram siap", "Hashtag trending", "A/B testing copy"],
    color: "from-purple-500 to-purple-600",
    stats: "3x lebih engaging",
    tag: "Fitur Utama"
  },
  {
    icon: Zap,
    title: "Brand Generator",
    description: "Buat identitas brand yang kuat dan konsisten dalam hitungan menit. AI menghasilkan nama, slogan, tone of voice, dan rekomendasi visual sesuai target pasar.",
    benefits: ["Generasi nama bisnis", "Brand story & tagline", "Color palette recommendation", "Market positioning"],
    color: "from-yellow-500 to-amber-600",
    stats: "Hemat 10+ jam branding",
    tag: "Baru"
  },
  {
    icon: TrendingUp,
    title: "Financial Insights",
    description: "Analisis dan visualisasi laporan keuangan yang kompleks dengan AI. Dapatkan insights dan rekomendasi untuk meningkatkan performa finansial bisnis.",
    benefits: ["Dashboard finansial", "Trend analysis", "Cash flow optimization", "Expense categorization"],
    color: "from-emerald-500 to-teal-600",
    stats: "ROI 3-5x lebih tinggi",
    tag: "Populer"
  },
  {
    icon: CheckSquare,
    title: "Manajemen Tugas Bisnis",
    description: "Kelola semua aspek bisnis dalam satu dashboard. Dari follow up customer hingga inventory management dengan prioritas AI.",
    benefits: ["Dashboard terpusat", "Reminder otomatis", "Progress tracking", "Team collaboration"],
    color: "from-orange-500 to-orange-600",
    stats: "80% produktivitas naik",
    tag: "Fitur Utama"
  }
];

const additionalFeatures = [
  {
    icon: Mic,
    title: "Speech-to-Text Indonesia",
    description: "Berbicara dalam Bahasa Indonesia untuk input yang lebih natural dan efisien"
  },
  {
    icon: Bot,
    title: "Multi-Agent AI System",
    description: "5 AI specialist siap membantu bisnis Anda 24/7 dengan pengetahuan mendalam"
  },
  {
    icon: Shield,
    title: "Data Aman & Private",
    description: "Enkripsi tingkat enterprise dengan privacy terjamin"
  },
  {
    icon: Clock,
    title: "Audiobooks & Learning",
    description: "Platform pembelajaran bisnis interaktif dengan konten audio premium"
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description: "Analisis pasar dan kompetitor dengan data real-time untuk keputusan tepat"
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description: "Ekstrak insights penting dari berbagai jenis dokumen bisnis secara instan"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Fitur AI Terlengkap untuk
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Bisnis Indonesia</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Dari startup hingga UKM mapan, semua yang Anda butuhkan untuk mengembangkan bisnis ada di satu platform
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const isLarge = index < 2;
            return (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white dark:bg-gray-800 relative overflow-hidden ${
                  isLarge ? 'md:col-span-1 lg:col-span-1' : ''
                } hover:scale-105 transform-gpu`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        feature.tag === 'Baru' ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300' :
                        feature.tag === 'Populer' ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300' :
                        'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {feature.tag}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3 group-hover:scale-125 transition-transform duration-300`} />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="group/btn text-blue-600 dark:text-blue-400 p-0 h-auto hover:bg-transparent">
                    <span className="group-hover/btn:mr-2 transition-all duration-200">Pelajari lebih lanjut</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:scale-110 transition-all duration-300" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 group-hover:shadow-lg transition-all duration-300">
                <feature.icon className="h-7 w-7 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl p-8 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dipercaya oleh <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ribuan UKM</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Platform AI terdepan untuk transformasi bisnis Indonesia
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">15K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">UKM Aktif</div>
              </div>
              
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">89%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Revenue Growth</div>
              </div>
              
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Star className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">4.9</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Rating Pengguna</div>
              </div>
              
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Rocket className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">2.3M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Konten Dihasilkan</div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Hemat rata-rata 15 jam/minggu
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                ROI 340% dalam 3 bulan
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                99.9% uptime guarantee
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CTA */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl -z-10" />
          <Button 
            asChild
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 transform-gpu group relative overflow-hidden"
          >
            <Link href="/register">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">Mulai Transformasi Bisnis Sekarang</span>
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
              Gratis 14 hari
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
              Tanpa kartu kredit
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
              Setup &lt; 2 menit
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-2">Dipercaya 15,000+ UKM di Indonesia</span>
          </div>
        </div>
      </div>
    </section>
  );
}