import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTAFooterSection } from '@/components/landing/cta-footer-section';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingLayout } from '@/components/landing/landing-layout';
import { StructuredData } from '@/components/landing/structured-data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UsahaKu AI - Platform AI Terdepan untuk UKM Indonesia',
  description: 'Kembangkan bisnis UKM dengan AI terpintar. Rencana bisnis otomatis, analisis keuangan cerdas, generator konten marketing, dan manajemen tugas dalam satu platform.',
  keywords: 'AI bisnis, UKM Indonesia, rencana bisnis AI, analisis keuangan, marketing AI, startup Indonesia',
  openGraph: {
    title: 'UsahaKu AI - Platform AI untuk UKM Indonesia',
    description: 'Transformasi bisnis dengan AI. Dari rencana bisnis hingga marketing, semua otomatis dengan teknologi terdepan.',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UsahaKu AI - AI untuk UKM Indonesia',
    description: 'Platform AI yang membantu UKM berkembang dengan rencana bisnis otomatis dan analisis cerdas.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <LandingLayout>
      <StructuredData />
      <LandingNavbar />
      <main className="min-h-screen">
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        <section id="testimonials">
          <TestimonialsSection />
        </section>
        <CTAFooterSection />
      </main>
    </LandingLayout>
  );
}
