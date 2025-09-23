"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  UploadCloud, 
  FileText, 
  X, 
  Save, 
  History, 
  Eye, 
  Download,
  FileSpreadsheet,
  Calculator,
  Table2
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

type FinancialAnalysisOutput = {
  transactions: Transaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    transactionCount: number;
  };
  insights: string[];
};

type SavedFinancialAnalysis = FinancialAnalysisOutput & {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
}

export default function FinancialSummaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<FinancialAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedFinancialAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedFinancialAnalysis | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadSavedAnalyses = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/financial-summary');
      if (response.ok) {
        const analyses = await response.json();
        setSavedAnalyses(analyses || []);
      } else {
        console.error('Failed to fetch financial analyses:', response.status);
      }
    } catch (error) {
      console.error('Error loading saved financial analyses:', error);
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
      const response = await fetch('/api/financial-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          transactions: result.transactions,
          summary: result.summary,
          insights: result.insights
        })
      });

      if (response.ok) {
        toast({
          title: "Analisis Keuangan Disimpan",
          description: `Analisis "${file.name}" berhasil disimpan.`,
        });

        // Reload saved data
        loadSavedAnalyses();
      } else {
        throw new Error('Failed to save financial analysis');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Gagal menyimpan analisis keuangan. Silakan coba lagi.",
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
    accept: { 
      'application/pdf': [],
      'image/*': [],
      'text/csv': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
    },
    maxFiles: 1,
  });

  const handleAnalyzeFinancial = async () => {
    if (!file) {
        toast({ variant: 'destructive', title: 'Tidak ada file dipilih' });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
        const documentDataUri = await fileToDataUri(file);
        
        const response = await fetch('/api/financial-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'analyze',
            documentDataUri,
            fileName: file.name,
            fileType: file.type
          })
        });
        
        if (response.ok) {
          const analysisResult = await response.json();
          setResult(analysisResult);
        } else {
          throw new Error('Failed to analyze financial document');
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Gagal Menganalisis Dokumen Keuangan',
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

  const viewAnalysisDetails = (analysis: SavedFinancialAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsViewingDetails(true);
  }

  const closeAnalysisDetails = () => {
    setSelectedAnalysis(null);
    setIsViewingDetails(false);
  }

  const exportToCSV = () => {
    if (!result?.transactions) return;
    
    const csvContent = [
      ['Tanggal', 'Deskripsi', 'Jumlah', 'Tipe', 'Kategori'],
      ...result.transactions.map(t => [
        t.date,
        t.description,
        t.amount.toString(),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_${file?.name?.split('.')[0] || 'keuangan'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Berhasil",
      description: "File CSV telah berhasil diunduh.",
    });
  };

  const exportToPDF = () => {
    if (!result) return;
    
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Analisis Keuangan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .summary-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
          .income { background-color: #f0f9ff; border-color: #10b981; }
          .expense { background-color: #fef2f2; border-color: #ef4444; }
          .profit { background-color: #f0f4ff; border-color: #3b82f6; }
          .count { background-color: #f8fafc; border-color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .income-cell { color: #10b981; font-weight: bold; }
          .expense-cell { color: #ef4444; font-weight: bold; }
          .insights { margin-top: 30px; }
          .insight { padding: 10px; margin-bottom: 10px; border-left: 4px solid #3b82f6; background-color: #f0f4ff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Analisis Keuangan</h1>
          <p>File: ${file?.name || 'Tidak diketahui'}</p>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div class="summary">
          <h2>Ringkasan Keuangan</h2>
          <div class="summary-grid">
            <div class="summary-card income">
              <h3>Total Pemasukan</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatCurrency(result.summary.totalIncome)}</p>
            </div>
            <div class="summary-card expense">
              <h3>Total Pengeluaran</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatCurrency(result.summary.totalExpense)}</p>
            </div>
            <div class="summary-card profit">
              <h3>Laba Bersih</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatCurrency(result.summary.netProfit)}</p>
            </div>
            <div class="summary-card count">
              <h3>Total Transaksi</h3>
              <p style="font-size: 24px; font-weight: bold;">${result.summary.transactionCount}</p>
            </div>
          </div>
        </div>
        
        <div class="transactions">
          <h2>Daftar Transaksi</h2>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Tipe</th>
              </tr>
            </thead>
            <tbody>
              ${result.transactions.map(t => `
                <tr>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.description}</td>
                  <td>${t.category}</td>
                  <td class="${t.type === 'income' ? 'income' : 'expense'}-cell">
                    ${formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${result.insights && result.insights.length > 0 ? `
          <div class="insights">
            <h2>Insight Keuangan</h2>
            ${result.insights.map(insight => `
              <div class="insight">
                <p>${insight}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Laporan ini dibuat secara otomatis oleh Sistem Analisis Keuangan UsahaKu AI</p>
          <p>Tanggal Pembuatan: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </body>
      </html>
    `;
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      };
    }
    
    toast({
      title: "Export PDF",
      description: "Dialog cetak telah dibuka. Pilih 'Save as PDF' di dialog print.",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Ringkasan Keuangan</h1>
        <p className="text-muted-foreground">
          Unggah laporan keuangan Anda untuk mengekstrak dan menganalisis data transaksi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unggah Laporan Keuangan</CardTitle>
          <CardDescription>
            Tarik dan lepas file Anda di sini, atau klik untuk memilih file. (PDF, JPG, PNG, CSV, Excel)
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
                PDF • JPG/PNG (OCR) • CSV • Excel
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
          
          <Button onClick={handleAnalyzeFinancial} disabled={!file || isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Calculator className="mr-2 h-4 w-4" />
            Analisis Laporan Keuangan
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Table2 className="mr-2 h-5 w-5" />
              Hasil Analisis Transaksi
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={saveAnalysis} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">Total Pemasukan</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(result.summary.totalIncome)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(result.summary.totalExpense)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">Laba Bersih</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(result.summary.netProfit)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Transaksi</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {result.summary.transactionCount}
                </p>
              </div>
            </div>
            
            {/* Transactions Table */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Daftar Transaksi</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Tipe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.transactions.map((transaction, index) => (
                      <TableRow key={transaction.id || index}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Insights */}
            {result.insights && result.insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Insight Keuangan</h3>
                <div className="space-y-3">
                  {result.insights.map((insight, index) => (
                    <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Saved Financial Analyses Section */}
      {savedAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Riwayat Analisis Keuangan ({savedAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedAnalyses.map((analysis) => (
                <Card key={analysis.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
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
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-green-600">Pemasukan: {formatCurrency(analysis.summary.totalIncome || 0)}</span>
                          <span className="text-red-600">Pengeluaran: {formatCurrency(analysis.summary.totalExpense || 0)}</span>
                          <span className="text-blue-600">Transaksi: {analysis.summary.transactionCount || 0}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewAnalysisDetails(analysis)}
                      className="ml-4"
                    >
                      <Eye className="mr-1 h-4 w-4" />
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
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Detail Analisis Keuangan: {selectedAnalysis?.file_name}
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
              
              {/* Financial Summary in Modal */}
              {selectedAnalysis.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400">Total Pemasukan</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(selectedAnalysis.summary.totalIncome || 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400">Total Pengeluaran</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(selectedAnalysis.summary.totalExpense || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400">Laba Bersih</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(selectedAnalysis.summary.netProfit || 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-600 dark:text-purple-400">Total Transaksi</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {selectedAnalysis.summary.transactionCount || 0}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Transactions in Modal */}
              {selectedAnalysis.transactions && Array.isArray(selectedAnalysis.transactions) && selectedAnalysis.transactions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Daftar Transaksi</h3>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead>Tipe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedAnalysis.transactions.map((transaction: Transaction, index: number) => (
                          <TableRow key={transaction.id || index}>
                            <TableCell className="font-medium text-sm">
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell className="text-sm">{transaction.description}</TableCell>
                            <TableCell className="text-sm">{transaction.category}</TableCell>
                            <TableCell className={`text-right font-medium text-sm ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(Math.abs(transaction.amount))}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {/* Insights in Modal */}
              {selectedAnalysis.insights && Array.isArray(selectedAnalysis.insights) && selectedAnalysis.insights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Insight Keuangan</h3>
                  <div className="space-y-2">
                    {selectedAnalysis.insights.map((insight: string, index: number) => (
                      <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (selectedAnalysis.transactions) {
                      const csvContent = [
                        ['Tanggal', 'Deskripsi', 'Jumlah', 'Tipe', 'Kategori'],
                        ...selectedAnalysis.transactions.map((t: Transaction) => [
                          t.date,
                          t.description,
                          t.amount.toString(),
                          t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                          t.category
                        ])
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `transaksi_${selectedAnalysis.file_name?.split('.')[0] || 'keuangan'}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      toast({
                        title: "Export Berhasil",
                        description: "File CSV telah berhasil diunduh.",
                      });
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
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
