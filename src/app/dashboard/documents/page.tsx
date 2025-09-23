"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileText, X, Lightbulb, ListChecks, FileSearch, Save, History, Eye, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/components/auth/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Tesseract from 'tesseract.js';

type SummarizeFinancialDocumentsOutput = {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
};

type SavedDocumentAnalysis = SummarizeFinancialDocumentsOutput & {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  key_points: string[];
};

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

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummarizeFinancialDocumentsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedDocumentAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedDocumentAnalysis | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [ocrResult, setOcrResult] = useState<SummarizeFinancialDocumentsOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadSavedAnalyses = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const analyses = await response.json();
        setSavedAnalyses(analyses || []);
      } else {
        console.error('Failed to fetch analyses:', response.status);
      }
    } catch (error) {
      console.error('Error loading saved analyses:', error);
    }
  }, [user?.id]);

  // Load saved analyses on component mount
  React.useEffect(() => {
    if (user?.id) {
      loadSavedAnalyses();
    }
  }, [user?.id, loadSavedAnalyses]);

  const saveAnalysis = async () => {
    if (!user?.id || !result || !file) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          summary: result.summary,
          key_points: result.keyPoints,
          recommendations: result.recommendations
        })
      });

      if (response.ok) {
        toast({
          title: "Analisis Dokumen Disimpan",
          description: `Analisis "${file.name}" berhasil disimpan.`,
        });

        // Reload saved data
        loadSavedAnalyses();
      } else {
        throw new Error('Failed to save analysis');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Gagal menyimpan analisis dokumen. Silakan coba lagi.",
      });
      console.error(error);
    }
    setIsSaving(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [], 'image/*': [] },
    maxFiles: 1,
  });

  const handleSummarize = async () => {
    if (!file) {
        toast({ variant: 'destructive', title: 'Tidak ada file dipilih' });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
        const documentDataUri = await fileToDataUri(file);
        
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'analyze',
            documentDataUri
          })
        });
        
        if (response.ok) {
          const analysisResult = await response.json();
          setResult(analysisResult);
        } else {
          throw new Error('Failed to analyze document');
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Gagal Meringkas Dokumen',
            description: 'Terjadi kesalahan saat memproses file Anda. Coba lagi.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
  }

  const viewAnalysisDetails = (analysis: SavedDocumentAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsViewingDetails(true);
  }

  const closeAnalysisDetails = () => {
    setSelectedAnalysis(null);
    setIsViewingDetails(false);
  }

  const processImageWithOCR = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'File bukan gambar',
        description: 'Silakan pilih file gambar (JPG, PNG, dll) untuk proses OCR.'
      });
      return;
    }

    setIsOCRProcessing(true);
    setOcrProgress(0);
    setExtractedText('');
    setOcrResult(null);

    try {
      console.log('Starting OCR processing for image...');
      
      // Create Tesseract worker
      const worker = await Tesseract.createWorker('eng+ind', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            setOcrProgress(progress);
            console.log(`OCR Progress: ${progress}%`);
          }
        }
      });

      try {
        // Recognize text from image
        const { data: { text, confidence } } = await worker.recognize(file);
        
        await worker.terminate();
        
        if (!text || text.trim().length < 3) {
          throw new Error('No readable text found in image. Try uploading a clearer image.');
        }
        
        console.log(`OCR completed with ${confidence.toFixed(1)}% confidence`);
        setExtractedText(text.trim());
        
        // Now analyze the extracted text with AI
        await analyzeExtractedText(text.trim());
        
      } catch (ocrError) {
        await worker.terminate();
        throw ocrError;
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        variant: 'destructive',
        title: 'OCR Processing Failed',
        description: error instanceof Error ? error.message : 'Unknown OCR error occurred.'
      });
    } finally {
      setIsOCRProcessing(false);
      setOcrProgress(0);
    }
  };

  const analyzeExtractedText = async (text: string) => {
    try {
      console.log('Analyzing extracted text with AI...');
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_text',
          text: text
        })
      });
      
      if (response.ok) {
        const analysisResult = await response.json();
        setOcrResult(analysisResult);
        toast({
          title: 'Analisis OCR Selesai',
          description: 'Teks berhasil diekstrak dan dianalisis oleh AI.'
        });
      } else {
        throw new Error('Failed to analyze extracted text');
      }
    } catch (error) {
      console.error('Analysis Error:', error);
      toast({
        variant: 'destructive',
        title: 'Analisis Gagal',
        description: 'Gagal menganalisis teks yang diekstrak.'
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Analisis Dokumen</h1>
        <p className="text-muted-foreground">
          Unggah dokumen keuangan Anda untuk mendapatkan ringkasan cerdas dari AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Dokumen</CardTitle>
          <CardDescription>
            Tarik dan lepas file Anda di sini, atau klik untuk memilih file. (PDF, JPG, PNG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? 'Lepaskan file di sini...' : 'Tarik & lepas atau klik untuk unggah'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF (text-based) • JPG/PNG (OCR)
              </p>
            </div>
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-lg border border-solid p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                    <FileText className="h-10 w-10 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    <Button variant="ghost" size="sm" onClick={removeFile} className="text-destructive hover:text-destructive">
                        <X className="mr-1 h-4 w-4" /> Hapus
                    </Button>
                </div>
            </div>
          )}
          {file && file.type.startsWith('image/') ? (
            <div className="space-y-2">
              <Button 
                onClick={() => processImageWithOCR(file)} 
                disabled={isOCRProcessing} 
                className="w-full"
              >
                {isOCRProcessing ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Memproses OCR... {ocrProgress}%
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analisis dengan OCR
                  </>
                )}
              </Button>
              {isOCRProcessing && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analisis Dokumen
            </Button>
          )}
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hasil Analisis Dokumen</CardTitle>
                <Button variant="outline" size="sm" onClick={saveAnalysis} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <h3 className="flex items-center text-lg font-semibold"><FileSearch className="mr-2 h-5 w-5 text-primary" /> Ringkasan Umum</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown>{result.summary}</ReactMarkdown>
                  </div>
               </div>
                <div className="space-y-2">
                  <h3 className="flex items-center text-lg font-semibold"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Poin-Poin Kunci</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {result.keyPoints.map((point, index) => (
                      <li key={index}><ReactMarkdown className="prose prose-sm max-w-none">{point}</ReactMarkdown></li>
                    ))}
                  </ul>
               </div>
               <div className="space-y-2">
                  <h3 className="flex items-center text-lg font-semibold"><Lightbulb className="mr-2 h-5 w-5 text-primary" /> Rekomendasi</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}><ReactMarkdown className="prose prose-sm max-w-none">{rec}</ReactMarkdown></li>
                    ))}
                  </ul>
               </div>
            </CardContent>
        </Card>
      )}
      
      {/* OCR Results Section */}
      {ocrResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Hasil Analisis OCR
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              if (file && extractedText && ocrResult) {
                // Save OCR result to database
                const saveOCRResult = async () => {
                  try {
                    const response = await fetch('/api/documents', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        action: 'save',
                        file_name: file.name,
                        file_size: file.size,
                        file_type: file.type,
                        summary: ocrResult.summary,
                        key_points: ocrResult.keyPoints,
                        recommendations: ocrResult.recommendations
                      })
                    });
                    
                    if (response.ok) {
                      toast({
                        title: "Hasil OCR Disimpan",
                        description: `Analisis OCR "${file.name}" berhasil disimpan.`,
                      });
                      loadSavedAnalyses();
                    }
                  } catch {
                    toast({
                      variant: "destructive",
                      title: "Gagal Menyimpan",
                      description: "Gagal menyimpan hasil OCR. Silakan coba lagi.",
                    });
                  }
                };
                saveOCRResult();
              }
            }}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show extracted text */}
            {extractedText && (
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold text-muted-foreground">
                  <Eye className="mr-2 h-4 w-4" /> 
                  Teks yang Diekstrak:
                </h3>
                <div className="bg-muted/50 p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                  {extractedText}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="flex items-center text-lg font-semibold">
                <FileSearch className="mr-2 h-5 w-5 text-primary" /> 
                Ringkasan Umum
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <ReactMarkdown>{ocrResult.summary}</ReactMarkdown>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-lg font-semibold">
                <ListChecks className="mr-2 h-5 w-5 text-primary" /> 
                Poin-Poin Kunci
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {ocrResult.keyPoints.map((point, index) => (
                  <li key={index}><ReactMarkdown className="prose prose-sm max-w-none">{point}</ReactMarkdown></li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-lg font-semibold">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" /> 
                Rekomendasi
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {ocrResult.recommendations.map((rec, index) => (
                  <li key={index}><ReactMarkdown className="prose prose-sm max-w-none">{rec}</ReactMarkdown></li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Saved Analyses Section */}
      {savedAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Riwayat Analisis ({savedAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedAnalyses.map((analysis) => (
                <Card key={analysis.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{analysis.file_name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.file_size && `${(analysis.file_size / 1024).toFixed(1)} KB • `}
                        {new Date(analysis.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {analysis.summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {analysis.summary.substring(0, 120)}...
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewAnalysisDetails(analysis)}
                      className="ml-4"
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Detail Analysis Modal */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Analisis: {selectedAnalysis?.file_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnalysis && (
            <div className="space-y-6 mt-4">
              {/* File Info */}
              <div className="text-sm text-muted-foreground">
                <p>Ukuran: {selectedAnalysis.file_size ? `${(selectedAnalysis.file_size / 1024).toFixed(1)} KB` : 'N/A'}</p>
                <p>Tanggal: {new Date(selectedAnalysis.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              {/* Summary */}
              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-semibold">
                  <FileSearch className="mr-2 h-5 w-5 text-primary" /> 
                  Ringkasan Umum
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/50 p-4 rounded-md">
                  <ReactMarkdown>{selectedAnalysis.summary || 'Tidak ada ringkasan tersedia'}</ReactMarkdown>
                </div>
              </div>
              
              {/* Key Points */}
              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-semibold">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" /> 
                  Poin-Poin Kunci
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {selectedAnalysis.key_points && Array.isArray(selectedAnalysis.key_points) ? 
                    selectedAnalysis.key_points.map((point: string, index: number) => (
                      <li key={index} className="bg-muted/30 p-2 rounded">
                        <ReactMarkdown className="prose prose-sm max-w-none">{point}</ReactMarkdown>
                      </li>
                    )) : (
                      <li className="text-muted-foreground">Tidak ada poin kunci tersedia</li>
                    )
                  }
                </ul>
              </div>
              
              {/* Recommendations */}
              <div className="space-y-2">
                <h3 className="flex items-center text-lg font-semibold">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary" /> 
                  Rekomendasi
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {selectedAnalysis.recommendations && Array.isArray(selectedAnalysis.recommendations) ? 
                    selectedAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="bg-primary/10 p-2 rounded">
                        <ReactMarkdown className="prose prose-sm max-w-none">{rec}</ReactMarkdown>
                      </li>
                    )) : (
                      <li className="text-muted-foreground">Tidak ada rekomendasi tersedia</li>
                    )
                  }
                </ul>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={closeAnalysisDetails} variant="outline">
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
