"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Download, Palette, Type } from 'lucide-react';

interface BrandIdentity {
  logoUrl: string;
  logoPrompt: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
  };
  typography: {
    headline: string;
    body: string;
    display: string;
  };
  brandPersonality: string[];
  visualStyle: string;
  mockups: string[];
  generationInfo?: {
    method: 'huggingface' | 'template';
    isAiGenerated: boolean;
    isTemplateGenerated: boolean;
    hasError: boolean;
    error?: string;
  };
}

export default function BrandGeneratorPage() {
  const [businessDescription, setBusinessDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const { toast } = useToast();

  const downloadLogo = async () => {
    if (!brandIdentity?.logoUrl) return;
    
    try {
      // If it's SVG data URL, download directly
      if (brandIdentity.logoUrl.startsWith('data:image/svg+xml')) {
        const link = document.createElement('a');
        link.href = brandIdentity.logoUrl;
        link.download = 'logo.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Logo berhasil didownload!',
          description: 'File logo SVG telah disimpan ke perangkat Anda.'
        });
      } else {
        // For other image URLs, fetch and download
        const response = await fetch(brandIdentity.logoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'logo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Logo berhasil didownload!',
          description: 'File logo telah disimpan ke perangkat Anda.'
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Gagal download logo',
        description: 'Terjadi kesalahan saat mendownload logo.'
      });
    }
  };

  const generateBrandIdentity = async () => {
    if (!businessDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Deskripsi bisnis diperlukan',
        description: 'Silakan masukkan deskripsi bisnis Anda terlebih dahulu.'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/brand-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessDescription })
      });

      if (!response.ok) throw new Error('Failed to generate brand identity');
      
      const result = await response.json();
      setBrandIdentity(result);
      
      // Dynamic toast based on generation method
      const isAiGenerated = result.generationInfo?.isAiGenerated;
      toast({
        title: 'Brand Identity Berhasil Dibuat!',
        description: isAiGenerated 
          ? '✨ AI telah membuat identitas visual lengkap dengan Stable Diffusion.'
          : '🎨 Identitas visual dibuat menggunakan Smart Template System.'
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Gagal Generate Brand Identity',
        description: 'Terjadi kesalahan saat membuat brand identity. Coba lagi.'
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline flex items-center">
          <Palette className="mr-3 h-8 w-8 text-primary" />
          AI Visual Brand Generator
        </h1>
        <p className="text-muted-foreground">
          Buat identitas visual lengkap untuk bisnis Anda dengan AI - logo, warna, typography, dan style guide.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi Bisnis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Contoh: Kedai kopi specialty dengan konsep minimalis modern, target pasar adalah pekerja kantoran dan digital nomad usia 25-40 tahun. Menggunakan biji kopi lokal berkualitas tinggi dari petani Indonesia..."
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <Button 
            onClick={generateBrandIdentity} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI sedang membuat brand identity Anda...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Brand Identity
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {brandIdentity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Logo Design */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 relative group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Image 
                    src={brandIdentity.logoUrl} 
                    alt="Generated Logo"
                    fill
                    className="object-contain p-4 relative z-10 drop-shadow-sm"
                  />
                  
                  {/* Generation method badge */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {brandIdentity.generationInfo?.isAiGenerated ? (
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        Template
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <strong className="text-blue-700">AI Creative Prompt:</strong>
                    </div>
                    <p className="text-sm leading-relaxed">{brandIdentity.logoPrompt}</p>
                  </div>
                  
                  {/* Regenerate option */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => generateBrandIdentity()}
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Regenerating...' : 'Regenerate New Version'}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={downloadLogo}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Logo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Brand Elements */}
          <div className="space-y-6">
            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(brandIdentity.typography).map(([type, font]) => (
                  <div key={type} className="space-y-1">
                    <div className="text-sm font-medium capitalize text-gray-600">{type} Font</div>
                    <div 
                      className="text-lg font-medium p-2 bg-gray-50 rounded border"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Brand Personality */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Personality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {brandIdentity.brandPersonality.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {trait}
                    </Badge>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-gray-600">Visual Style</div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {brandIdentity.visualStyle}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {Object.entries(brandIdentity.colorPalette).map(([name, color], index) => (
                    <div 
                      key={name} 
                      className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        navigator.clipboard.writeText(color);
                        toast({
                          title: 'Color copied!',
                          description: `${color} copied to clipboard`
                        });
                      }}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div 
                        className="w-full h-24 rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:border-gray-300 relative overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        {/* Gradient overlay for depth */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                        
                        {/* Copy indicator */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <Type className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-sm capitalize font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1 group-hover:text-gray-600 transition-colors">{color}</div>
                        <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">Click to copy</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Color harmony info */}
                <div className="mt-6 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <Palette className="h-4 w-4" />
                    <span className="font-medium">Color Psychology:</span>
                  </div>
                  <p className="text-sm text-indigo-600 mt-1">This palette evokes professionalism, trust, and creativity - perfect for modern Indonesian businesses.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Mockups Section */}
      {brandIdentity && brandIdentity.mockups && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Mockups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brandIdentity.mockups.map((mockup, index) => {
                const mockupTypes = ['Business Card', 'Website Header', 'Social Media Post'];
                return (
                  <div 
                    key={index} 
                    className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 relative group-hover:border-gray-300 group-hover:shadow-xl transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <Image 
                        src={mockup} 
                        alt={`Brand Mockup ${index + 1}`}
                        fill
                        className="object-contain p-4 relative z-10 drop-shadow-sm"
                      />
                      
                      {/* Mockup type badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full font-medium border border-gray-200">
                        {mockupTypes[index] || `Mockup ${index + 1}`}
                      </div>
                      
                      {/* Download hint */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-blue-500 text-white p-2 rounded-full">
                          <Download className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mockup info */}
                    <div className="mt-3 text-center">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {mockupTypes[index] || `Mockup ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Ready for use</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Usage guide */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Usage Tips:</span>
              </div>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Use business card mockup for networking materials</li>
                <li>• Website header works great for online presence</li>
                <li>• Social media posts boost brand consistency</li>
                <li>• All designs are optimized for print and digital use</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}