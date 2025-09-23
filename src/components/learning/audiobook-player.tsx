"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { isSpeechSynthesisSupported } from '@/lib/text-to-speech';
import { useToast } from '@/hooks/use-toast';

interface Audiobook {
  id: string;
  title: string;
  description: string;
  content: string;
  audio_url?: string | null;
  duration_minutes?: number | null;
  play_count?: number;
}

interface AudiobookPlayerProps {
  audiobook: Audiobook;
  onClose?: () => void;
  onPlayCountUpdate?: (audiobookId: string) => void;
}

export function AudiobookPlayerComponent({ audiobook, onClose, onPlayCountUpdate }: AudiobookPlayerProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80); // 80% = 0.8
  const [speechRate, setSpeechRate] = useState(100); // 100% = 1.0
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const hasPlayedRef = useRef(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if browser supports speech synthesis
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isBrowser && speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [isBrowser]);

  const handlePlay = () => {
    if (!isBrowser || !('speechSynthesis' in window)) {
      toast({
        title: 'Tidak Didukung',
        description: 'Browser Anda tidak mendukung text-to-speech',
        variant: 'destructive',
      });
      return;
    }

    if (isPaused && speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    setIsLoading(true);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(audiobook.content);
    speechRef.current = utterance;

    // Configure speech settings
    utterance.volume = volume / 100;
    utterance.rate = speechRate / 100;
    utterance.pitch = 1;
    
    // Try to use Indonesian voice if available
    const voices = speechSynthesis.getVoices();
    const indonesianVoice = voices.find(voice => 
      voice.lang.includes('id') || 
      voice.lang.includes('ID') ||
      voice.name.toLowerCase().includes('indonesia') ||
      voice.name.toLowerCase().includes('indonesian') ||
      voice.lang.startsWith('id-')
    );
    
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
      console.log('Using Indonesian voice:', indonesianVoice.name);
    } else {
      console.log('Indonesian voice not found, using default voice');
    }
    
    // Set language to Indonesian
    utterance.lang = 'id-ID';

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setIsPaused(false);
      
      // Track play count on first play
      if (!hasPlayedRef.current) {
        hasPlayedRef.current = true;
        onPlayCountUpdate?.(audiobook.id);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      toast({
        title: "Audiobook Selesai",
        description: `Anda telah menyelesaikan "${audiobook.title}". Terima kasih telah mendengarkan!`,
      });
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setIsLoading(false);
      
      // Don't show error toast for normal interruptions when user stops audio
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        toast({
          title: 'Kesalahan Audio',
          description: 'Terjadi kesalahan saat memutar audio',
          variant: 'destructive',
        });
      }
    };

    // Simulate progress (since we can't get real progress from Web Speech API)
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const estimatedProgress = (event.charIndex / audiobook.content.length) * 100;
        setProgress(Math.min(estimatedProgress, 95));
      }
    };

    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isBrowser && speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (isBrowser) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
    setIsPaused(false);
    speechRef.current = null;
    hasPlayedRef.current = false;
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (speechRef.current) {
      speechRef.current.volume = newVolume / 100;
    }
  };

  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setSpeechRate(newRate);
    if (speechRef.current) {
      speechRef.current.rate = newRate / 100;
    }
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const estimatedDuration = Math.ceil(audiobook.content.length / 1000); // Rough estimate: 1 char per second at normal speed

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <div>
                  <CardTitle className="text-2xl">{audiobook.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{audiobook.description}</p>
                </div>
              </div>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Player Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress: {progress}%</span>
                  <span>Estimasi durasi: ~{formatTime(estimatedDuration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  disabled={isLoading || (isPlaying && !isPaused)}
                  className="h-12 w-12 rounded-full"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                  disabled={!isPlaying || isPaused}
                  className="h-12 w-12 rounded-full"
                >
                  <Pause className="h-6 w-6" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  className="h-12 w-12 rounded-full"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </div>

              {/* Audio Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Volume Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Volume: {volume}%
                  </label>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Kecepatan: {speechRate}%
                  </label>
                  <Slider
                    value={[speechRate]}
                    onValueChange={handleRateChange}
                    min={50}
                    max={150}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Toggle Transcript */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  {showTranscript ? 'Sembunyikan' : 'Tampilkan'} Transkrip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript */}
        {showTranscript && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transkrip</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {audiobook.content.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    return (
                      <p key={index} className="mb-4 leading-relaxed text-justify">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        {!isSpeechSynthesisSupported() && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-medium">Browser Tidak Mendukung</p>
                <p className="text-sm">
                  Browser Anda tidak mendukung fitur text-to-speech. 
                  Silakan gunakan browser modern seperti Chrome, Firefox, atau Safari.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  );
}