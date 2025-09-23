"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Brain, Rocket } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Input Data Bisnis",
    description: "Upload dokumen bisnis, foto produk, atau ceritakan ide bisnis Anda. AI kami mendukung berbagai format file.",
    details: ["PDF, Excel, Word", "JPG, PNG untuk OCR", "Input teks langsung", "Import dari cloud storage"],
    color: "from-blue-500 to-blue-600"
  },
  {
    step: "02", 
    icon: Brain,
    title: "AI Menganalisis",
    description: "Teknologi AI terdepan menganalisis data Anda dengan akurasi tinggi dan menghasilkan insight mendalam.",
    details: ["Natural Language Processing", "Computer Vision untuk gambar", "Machine Learning models", "Real-time processing"],
    color: "from-purple-500 to-purple-600"
  },
  {
    step: "03",
    icon: Rocket,
    title: "Dapatkan Hasil Actionable",
    description: "Terima laporan lengkap, strategi bisnis, dan rekomendasi yang bisa langsung Anda implementasikan.",
    details: ["Rencana bisnis PDF", "Action items prioritas", "Timeline implementasi", "KPI untuk tracking"],
    color: "from-green-500 to-green-600"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Cara Kerja 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Super Simple</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Hanya 3 langkah mudah untuk mengubah bisnis Anda dengan kekuatan AI
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center lg:text-left">
                {/* Step Circle */}
                <div className={`mx-auto lg:mx-0 w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 relative z-10 shadow-lg`}>
                  <step.icon className="h-8 w-8" />
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                  
                  {/* Details List */}
                  <ul className="space-y-2 text-sm">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-gray-500 dark:text-gray-400">
                        <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full mr-3 flex-shrink-0`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8 mb-4">
                    <ArrowRight className="h-6 w-6 text-gray-300 dark:text-gray-600 transform rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Lihat AI Bekerja dalam 2 Menit
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Tonton demo singkat bagaimana UsahaKu AI mengubah ide bisnis sederhana 
              menjadi rencana bisnis profesional yang siap implementasi.
            </p>
            
            {/* Demo CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link href="/register">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="group">
                <svg className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Tonton Demo Video
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Gratis tanpa batas waktu
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Setup dalam 2 menit
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                Data 100% aman
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}