/**
 * Text-to-Speech utility for audiobook playback
 * Uses Web Speech API for Indonesian language support
 */

export interface TextToSpeechOptions {
  text: string;
  lang?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: SpeechSynthesisVoice;
}

export interface AudiobookPlayer {
  speak: (text: string, options?: Partial<TextToSpeechOptions>) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number; // 0 to 100
  onProgressChange?: (progress: number) => void;
  onPlayStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  onComplete?: () => void;
}

class AudiobookPlayerImpl implements AudiobookPlayer {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private _isPlaying = false;
  private _isPaused = false;
  private _currentText = '';
  private _progress = 0;
  private textChunks: string[] = [];
  private currentChunkIndex = 0;

  public onProgressChange?: (progress: number) => void;
  public onPlayStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  public onComplete?: () => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  get currentText(): string {
    return this._currentText;
  }

  get progress(): number {
    return this._progress;
  }

  private updateProgress() {
    if (this.textChunks.length > 0) {
      const progress = Math.round((this.currentChunkIndex / this.textChunks.length) * 100);
      if (progress !== this._progress) {
        this._progress = progress;
        this.onProgressChange?.(progress);
      }
    }
  }

  private updatePlayState(isPlaying: boolean, isPaused: boolean) {
    this._isPlaying = isPlaying;
    this._isPaused = isPaused;
    this.onPlayStateChange?.(isPlaying, isPaused);
  }

  private chunkText(text: string): string[] {
    // Split text into smaller chunks for better control and progress tracking
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const chunks: string[] = [];
    
    let currentChunk = '';
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 200) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim() + '.');
        }
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence.trim();
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim() + '.');
    }
    
    return chunks;
  }

  private getIndonesianVoice(): SpeechSynthesisVoice | null {
    const voices = this.synthesis.getVoices();
    
    // Try to find Indonesian voice
    const indonesianVoice = voices.find(voice => 
      voice.lang.includes('id') || 
      voice.lang.includes('ID') ||
      voice.name.toLowerCase().includes('indonesia') ||
      voice.name.toLowerCase().includes('indonesian') ||
      voice.lang.startsWith('id-')
    );
    
    if (indonesianVoice) {
      console.log('Using Indonesian voice:', indonesianVoice.name);
      return indonesianVoice;
    } else {
      console.log('Indonesian voice not found, using default voice');
      return voices[0] || null; // Return first available voice as fallback
    }
  }

  private speakChunk(chunkIndex: number, options: TextToSpeechOptions): Promise<void> {
    return new Promise((resolve) => {
      if (chunkIndex >= this.textChunks.length) {
        resolve();
        return;
      }

      const chunk = this.textChunks[chunkIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);
      
      utterance.lang = options.lang || 'id-ID';
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      const voice = options.voice || this.getIndonesianVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.currentChunkIndex = chunkIndex;
        this.updateProgress();
        if (!this._isPlaying) {
          this.updatePlayState(true, false);
        }
      };

      utterance.onend = () => {
        this.currentChunkIndex = chunkIndex + 1;
        this.updateProgress();
        resolve();
      };

      utterance.onerror = (event) => {
        // Don't log normal interruption errors
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event.error || 'Audio dihentikan');
        }
        // Treat all errors as completion to avoid breaking the flow
        resolve();
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  private async speakAllChunks(options: TextToSpeechOptions): Promise<void> {
    for (let i = this.currentChunkIndex; i < this.textChunks.length; i++) {
      if (!this._isPlaying) {
        break; // Stop was called
      }
      
      while (this._isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      try {
        await this.speakChunk(i, options);
      } catch (error) {
        console.error('Error speaking chunk:', error);
        continue;
      }
    }

    // Completed all chunks
    this._progress = 100;
    this.updatePlayState(false, false);
    this.onProgressChange?.(100);
    this.onComplete?.();
  }

  async speak(text: string, options: Partial<TextToSpeechOptions> = {}): Promise<void> {
    this.stop(); // Stop any current playback
    
    this._currentText = text;
    this.textChunks = this.chunkText(text);
    this.currentChunkIndex = 0;
    this._progress = 0;

    const fullOptions: TextToSpeechOptions = {
      text,
      lang: 'id-ID',
      rate: 0.9,
      pitch: 1,
      volume: 1,
      ...options
    };

    this.updatePlayState(true, false);
    await this.speakAllChunks(fullOptions);
  }

  pause(): void {
    if (this._isPlaying && !this._isPaused) {
      this.synthesis.pause();
      this.updatePlayState(true, true);
    }
  }

  resume(): void {
    if (this._isPlaying && this._isPaused) {
      this.synthesis.resume();
      this.updatePlayState(true, false);
    }
  }

  stop(): void {
    try {
      // Set flags first to prevent any new chunks from starting
      this.updatePlayState(false, false);
      
      // Cancel current speech
      if (this.synthesis.speaking || this.synthesis.pending) {
        this.synthesis.cancel();
      }
      
      // Clean up
      this.currentUtterance = null;
      this.currentChunkIndex = 0;
      this._progress = 0;
      this.onProgressChange?.(0);
    } catch (error) {
      console.warn('Error stopping speech synthesis:', error);
      // Force clean up even if cancel fails
      this.currentUtterance = null;
      this.currentChunkIndex = 0;
      this._progress = 0;
      this.updatePlayState(false, false);
      this.onProgressChange?.(0);
    }
  }
}

export function createAudiobookPlayer(): AudiobookPlayer {
  return new AudiobookPlayerImpl();
}

// Utility function to check if speech synthesis is supported
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Utility function to get available voices
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synthesis = window.speechSynthesis;
    
    const getVoices = () => {
      const voices = synthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Some browsers load voices asynchronously
        setTimeout(getVoices, 100);
      }
    };
    
    if (synthesis.onvoiceschanged !== undefined) {
      synthesis.onvoiceschanged = getVoices;
    }
    
    getVoices();
  });
}

// Utility function to get only Indonesian voices
export function getIndonesianVoices(): Promise<SpeechSynthesisVoice[]> {
  return getAvailableVoices().then(voices => {
    return voices.filter(voice => {
      const lang = voice.lang.toLowerCase();
      const name = voice.name.toLowerCase();
      return lang.startsWith('id-') || lang === 'id' || 
             lang.includes('indonesi') || name.includes('indonesi') ||
             lang.includes('ms-') || lang.includes('malay'); // Malaysian can work for Indonesian
    });
  });
}

// Utility function to check if Indonesian voices are available
export function hasIndonesianVoices(): Promise<boolean> {
  return getIndonesianVoices().then(voices => voices.length > 0);
}
