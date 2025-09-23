"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Wijaya",
    role: "Founder Kedai Kopi Nusantara",
    company: "Jakarta",
    content: "UsahaKu AI mengubah cara saya menjalankan bisnis. Dari yang awalnya bingung mau ekspansi kemana, sekarang punya roadmap jelas berkat business plan AI-nya. Omzet naik 40% dalam 3 bulan!",
    rating: 5,
    avatar: "SW"
  },
  {
    name: "Andi Pratama", 
    role: "Owner Fashion Store",
    company: "Surabaya",
    content: "Fitur analisis keuangannya luar biasa! Cuma upload laporan Excel, langsung dapat insight mendalam tentang cash flow. Sekarang bisa prediksi kapan butuh modal tambahan.",
    rating: 5,
    avatar: "AP"
  },
  {
    name: "Maya Sari",
    role: "Digital Marketing Agency",
    company: "Bandung", 
    content: "Generator konten marketing-nya game changer! Tinggal foto produk klien, dalam hitungan detik dapat caption Instagram yang engaging plus hashtag trending. Klien pada happy semua.",
    rating: 5,
    avatar: "MS"
  },
  {
    name: "Rizky Hakim",
    role: "Startup Food Tech",
    company: "Yogyakarta",
    content: "Sebagai startup yang bergerak cepat, UsahaKu AI membantu banget untuk keep track semua task dan prioritas. Dashboard-nya intuitif, team jadi lebih organized dan produktif.",
    rating: 5,
    avatar: "RH"
  },
  {
    name: "Linda Chen",
    role: "E-commerce Owner",
    company: "Medan",
    content: "Awalnya skeptis sama AI, tapi setelah coba ternyata hasilnya akurat banget. Rekomendasi strateginya applicable dan hasilnya terukur. ROI meningkat 60% setelah implementasi sarannya.",
    rating: 5,
    avatar: "LC"
  },
  {
    name: "Budi Santoso",
    role: "Manufaktur UMKM",
    company: "Solo",
    content: "Paling suka fitur OCR-nya yang bisa scan dokumen keuangan. Hemat waktu banget, yang biasanya input manual 2 jam, sekarang cuma 5 menit. Akurasi data juga tinggi.",
    rating: 5,
    avatar: "BS"
  }
];

const stats = [
  { number: "1000+", label: "UKM Terdaftar" },
  { number: "95%", label: "Tingkat Kepuasan" },
  { number: "3x", label: "Rata-rata Growth" },
  { number: "80%", label: "Hemat Waktu" }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Dipercaya oleh 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 1000+ Pengusaha</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Dari startup rintisan hingga UKM mapan, mereka semua merasakan transformasi bisnis dengan AI
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Quote className="h-4 w-4 text-white" />
                </div>

                {/* Rating Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Trusted by entrepreneurs across Indonesia
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">SOC 2 Type II</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}