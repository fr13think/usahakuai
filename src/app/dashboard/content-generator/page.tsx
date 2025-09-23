"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Image as ImageIcon, X, Copy, Save, Sparkles, Hash, Type } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

interface GeneratedContent {
  title: string;
  description: string;
  hashtags: string[];
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ContentGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png'] 
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleGenerateContent = async () => {
    if (!file) {
      toast({ 
        variant: 'destructive', 
        title: 'Tidak ada file dipilih',
        description: 'Silakan pilih gambar produk terlebih dahulu.' 
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const imageDataUri = await fileToDataUri(file);
      
      const response = await fetch('/api/content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUri
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setResult(responseData);
        
        toast({
          title: 'Konten Berhasil Dibuat!',
          description: 'AI telah menganalisis gambar dan membuat konten penjualan untuk Anda.',
        });
      } else {
        throw new Error(responseData.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Konten',
        description: 'Terjadi kesalahan saat memproses gambar Anda. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} Disalin`,
        description: `${type} telah disalin ke clipboard.`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin ke clipboard.',
      });
    }
  };

  const saveContent = async () => {
    if (!user?.id || !result || !file) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          fileName: file.name,
          fileSize: file.size,
          title: result.title,
          description: result.description,
          hashtags: result.hashtags
        })
      });

      if (response.ok) {
        toast({
          title: 'Konten Tersimpan',
          description: 'Konten penjualan berhasil disimpan ke riwayat Anda.',
        });
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Gagal menyimpan konten. Silakan coba lagi.',
      });
      console.error(error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-primary" />
          Generator Konten Penjualan
        </h1>
        <p className="text-muted-foreground">
          Unggah gambar produk dan biarkan AI membuatkan deskripsi penjualan yang menarik untuk Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Gambar Produk</CardTitle>
          <CardDescription>
            Tarik dan lepas gambar produk Anda di sini, atau klik untuk memilih file. (JPG, JPEG, PNG - Maks 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {isDragActive ? 'Lepaskan gambar di sini...' : 'Unggah Gambar Produk'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Drag & drop atau klik untuk memilih
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, JPEG, PNG (maks 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-muted/50 rounded-lg p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="absolute top-2 right-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-start space-x-4">
                  {previewUrl && (
                    <div className="flex-shrink-0 relative w-24 h-24">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium truncate">{file.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.type}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateContent} 
                disabled={isLoading} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI sedang menganalisis gambar dan meracik kata-kata...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Buat Konten Penjualan
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-primary">
                <Sparkles className="mr-2 h-5 w-5" />
                Hasil Konten dari AI
              </CardTitle>
              {user && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveContent}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              )}
            </div>
            <CardDescription>
              Salin dan tempel konten ini ke platform penjualan atau media sosial Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title/Caption */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center font-semibold text-lg">
                  <Type className="mr-2 h-5 w-5 text-primary" />
                  Judul / Caption
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.title, 'Judul')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border">
                <p className="font-medium text-foreground">{result.title}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center font-semibold text-lg">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                  Deskripsi Penjualan (Copy)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.description, 'Deskripsi')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.description}</p>
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center font-semibold text-lg">
                  <Hash className="mr-2 h-5 w-5 text-primary" />
                  Saran Hashtag
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.hashtags.join(' '), 'Hashtag')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border">
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
