"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, MapPin, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export function CTAFooterSection() {
  return (
    <>
      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Siap Transformasi Bisnis Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengusaha Indonesia yang sudah merasakan kekuatan AI 
            untuk mengembangkan bisnis mereka.
          </p>
          
          {/* Email Capture Form */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <Input 
                placeholder="Masukkan email bisnis Anda"
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/register">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Konsultasi Gratis
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Gratis selamanya
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
              Setup 2 menit
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
              Tidak perlu kartu kredit
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <h3 className="text-xl font-bold">UsahaKu AI</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Platform AI terdepan yang membantu pengusaha Indonesia mengembangkan bisnis 
                dengan teknologi artificial intelligence terkini.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@usahaku.ai</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/dashboard/assistant" className="hover:text-white transition-colors">
                    Rencana Bisnis AI
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/financial-summary" className="hover:text-white transition-colors">
                    Analisis Keuangan
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/content-generator" className="hover:text-white transition-colors">
                    Generator Konten
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/tasks" className="hover:text-white transition-colors">
                    Manajemen Tugas
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/documents" className="hover:text-white transition-colors">
                    Analisis Dokumen
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/tentang" className="hover:text-white transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/karir" className="hover:text-white transition-colors">
                    Karir
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link href="/bantuan" className="hover:text-white transition-colors">
                    Pusat Bantuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h4 className="font-semibold mb-2">Dapatkan Update Terbaru</h4>
                <p className="text-gray-300 text-sm">
                  Tips bisnis, fitur baru, dan insight AI untuk UKM Indonesia
                </p>
              </div>
              
              <div className="flex gap-2 max-w-sm w-full md:w-auto">
                <Input 
                  placeholder="Email Anda"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Berlangganan
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 UsahaKu AI. Semua hak dilindungi.
            </div>
            
            <div className="flex space-x-6">
              {/* Social Links */}
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-8 pt-4 border-t border-gray-800 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Kebijakan Cookie
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                Keamanan Data
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}