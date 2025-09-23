"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Bot,
  User,
  Trash2,
  Lightbulb,
  Volume2,
  VolumeX,
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Loader2,
  History,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentType, ChatMessage, agents, exampleQuestions } from "@/lib/ai-agents";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Agent icons mapping
const agentIcons = {
  'business-strategy': Target,
  'financial-advisor': DollarSign,
  'market-analyst': TrendingUp,
  'risk-assessor': AlertTriangle,
  'learning-curator': BookOpen,
};

// Agent colors mapping
const agentColors = {
  'business-strategy': 'bg-blue-500',
  'financial-advisor': 'bg-green-500', 
  'market-analyst': 'bg-purple-500',
  'risk-assessor': 'bg-red-500',
  'learning-curator': 'bg-indigo-500',
};

export default function ChatAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [indonesianVoicesAvailable, setIndonesianVoicesAvailable] = useState(false);
  
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'id-ID'; // Indonesian
        
        recognition.onstart = () => {
          setSpeechStatus('listening');
          // Auto-timeout after 10 seconds
          speechTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening) {
              recognition.stop();
              setSpeechStatus('error');
              console.log('Speech recognition timeout');
            }
          }, 10000);
        };
        
        recognition.onresult = (event) => {
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          setSpeechStatus('processing');
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            setInputValue(transcript);
          }
          setIsListening(false);
          setSpeechStatus('idle');
        };
        
        recognition.onerror = (event) => {
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setSpeechStatus('error');
          
          switch (event.error) {
            case 'not-allowed':
              toast({
                title: "Mikrophone tidak diizinkan",
                description: "Silakan berikan izin mikrophone untuk menggunakan fitur suara.",
                variant: "destructive",
              });
              break;
            case 'no-speech':
              toast({
                title: "Suara tidak terdeteksi",
                description: "Silakan bicara lebih jelas dan coba lagi.",
                variant: "default",
              });
              setTimeout(() => setSpeechStatus('idle'), 1500);
              break;
            case 'network':
              toast({
                title: "Koneksi internet dibutuhkan",
                description: "Speech recognition membutuhkan koneksi internet.",
                variant: "destructive",
              });
              break;
            case 'service-not-allowed':
              toast({
                title: "Service tidak tersedia",
                description: "Speech recognition service tidak tersedia.",
                variant: "destructive",
              });
              break;
            default:
              toast({
                title: "Speech recognition error",
                description: `Error: ${event.error}. Silakan coba lagi.`,
                variant: "destructive",
              });
              setTimeout(() => setSpeechStatus('idle'), 1500);
              break;
          }
        };
        
        recognition.onend = () => {
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          setIsListening(false);
          if (speechStatus === 'listening') {
            setSpeechStatus('idle');
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [isListening, speechStatus, toast]);

  // Initialize speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Check for Indonesian voices
        const indonesianVoices = voices.filter(voice => 
          voice.lang.toLowerCase().includes('id') || 
          voice.lang.toLowerCase().includes('indonesi') ||
          voice.name.toLowerCase().includes('indonesi')
        );
        
        setIndonesianVoicesAvailable(indonesianVoices.length > 0);
        
        console.log('Available voices:', voices.length);
        console.log('Indonesian voices:', indonesianVoices.length);
        indonesianVoices.forEach(voice => {
          console.log('Indonesian voice:', voice.name, voice.lang, voice.localService ? '(local)' : '(remote)');
        });
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voiceschanged event (some browsers load voices asynchronously)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    // Keep examples visible - don't hide them

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
          selectedAgent: selectedAgent,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.response,
        agentType: data.agentType,
        timestamp: new Date().toISOString(),
        metadata: {
          sources: data.sources,
          confidence: data.confidence,
        },
      };

      setMessages(prev => [...prev, agentMessage]);

      // Text-to-speech if enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        // Use cached voices or get fresh ones
        const voices = availableVoices.length > 0 ? availableVoices : speechSynthesis.getVoices();
        
        // Find Indonesian voices (with priority order)
        const indonesianVoices = voices.filter(voice => {
          const lang = voice.lang.toLowerCase();
          const name = voice.name.toLowerCase();
          return lang.startsWith('id-') || lang === 'id' || 
                 lang.includes('indonesi') || name.includes('indonesi');
        });
        
        // Sort Indonesian voices by preference (local first, then by name)
        indonesianVoices.sort((a, b) => {
          if (a.localService && !b.localService) return -1;
          if (!a.localService && b.localService) return 1;
          return a.name.localeCompare(b.name);
        });
        
        // If no Indonesian voices, try to find Malay (similar language)
        const malayVoices = voices.filter(voice => {
          const lang = voice.lang.toLowerCase();
          return lang.startsWith('ms-') || lang === 'ms' || lang.includes('malay');
        });
        
        const selectedVoice = indonesianVoices[0] || malayVoices[0];
        
        if (selectedVoice) {
          const utterance = new SpeechSynthesisUtterance(data.response);
          utterance.voice = selectedVoice;
          utterance.lang = 'id-ID'; // Force Indonesian language
          utterance.rate = 0.8; // Slower rate for better pronunciation
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          console.log('Using voice for TTS:', selectedVoice.name, selectedVoice.lang, selectedVoice.localService ? '(local)' : '(remote)');
          
          utterance.onstart = () => {
            setIsSpeaking(true);
            console.log('TTS started with voice:', utterance.voice?.name, 'lang:', utterance.lang);
          };
          
          utterance.onend = () => {
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
            console.log('TTS ended successfully');
          };
          
          utterance.onerror = (event) => {
            // Don't log or show error for normal interruptions
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
              console.error('TTS error:', event.error || 'Unknown error');
              toast({
                title: "Text-to-Speech Error",
                description: `Gagal memutar suara: ${event.error || 'Unknown error'}. Coba lagi.`,
                variant: "destructive",
              });
            }
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
          };
          
          speechSynthesisRef.current = utterance;
          speechSynthesis.speak(utterance);
          
        } else {
          console.log('Indonesian voice not found, using default voice');
          
          // Use first available voice with Indonesian language setting
          const utterance = new SpeechSynthesisUtterance(data.response);
          const firstVoice = voices[0];
          if (firstVoice) {
            utterance.voice = firstVoice;
          }
          utterance.lang = 'id-ID';
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onstart = () => {
            setIsSpeaking(true);
            speechSynthesisRef.current = utterance;
          };
          
          utterance.onend = () => {
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
          };
          
          utterance.onerror = (event) => {
            // Don't log or show error for normal interruptions
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
              console.error('TTS error:', event.error || 'Unknown error');
              toast({
                title: "Text-to-Speech Error",
                description: `Gagal memutar suara: ${event.error || 'Unknown error'}. Coba lagi.`,
                variant: "destructive",
              });
            }
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
          };
          
          speechSynthesisRef.current = utterance;
          speechSynthesis.speak(utterance);
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      let errorTitle = "Terjadi kesalahan";
      let errorDescription = "Silakan coba lagi dalam beberapa saat.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorTitle = "Request timeout";
          errorDescription = "Permintaan memakan waktu terlalu lama. Coba lagi.";
        } else if (error.message.includes('Failed to fetch')) {
          errorTitle = "Koneksi bermasalah";
          errorDescription = "Periksa koneksi internet Anda dan coba lagi.";
        } else if (error.message.includes('AI service tidak tersedia')) {
          errorTitle = "AI service tidak tersedia";
          errorDescription = "GROQ API belum dikonfigurasi. Hubungi administrator.";
        } else {
          errorDescription = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `⚠️ ${errorTitle}: ${errorDescription}`,
        timestamp: new Date().toISOString(),
        metadata: { confidence: 0 },
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API - Direct browser speech recognition (preferred)
  const startWebSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition tidak didukung di browser ini.');
      return;
    }
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Web Speech recognition error:', error);
      setIsListening(false);
      alert('Gagal memulai speech recognition. Silakan coba lagi.');
    }
  };

  const stopWebSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // MediaRecorder API - Fallback for server-side processing
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Voice recording error:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Speech-to-text failed');
      }

      const data = await response.json();
      if (data.text) {
        setInputValue(data.text);
      }
    } catch (error) {
      console.error('Speech-to-text error:', error);
      alert('Server speech-to-text gagal. Gunakan tombol mikrofon utama untuk Web Speech API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop text-to-speech function
  const stopTextToSpeech = () => {
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    } catch (error) {
      console.warn('Error stopping TTS:', error);
      // Force clean up
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    }
  };

  // Test Indonesian TTS function (kept for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testIndonesianTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech tidak didukung di browser ini.');
      return;
    }

    const voices = availableVoices.length > 0 ? availableVoices : speechSynthesis.getVoices();
    const indonesianVoices = voices.filter(voice => {
      const lang = voice.lang.toLowerCase();
      const name = voice.name.toLowerCase();
      return lang.startsWith('id-') || lang === 'id' || 
             lang.includes('indonesi') || name.includes('indonesi');
    });

    const testText = "Selamat datang di Chat AI. Saya akan berbicara dalam bahasa Indonesia.";
    
    if (indonesianVoices.length > 0) {
      const selectedVoice = indonesianVoices[0];
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.voice = selectedVoice;
      utterance.lang = 'id-ID';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        toast({
          title: "Test TTS Selesai",
          description: `Voice: ${selectedVoice.name} (${selectedVoice.lang})`,
          variant: "default",
        });
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        
        // Don't show error for normal interruptions
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Test TTS error:', event.error || 'Unknown error');
          toast({
            title: "Test TTS Gagal",
            description: `Error: ${event.error || 'Unknown error'}`,
            variant: "destructive",
          });
        }
      };
      
      speechSynthesis.speak(utterance);
      console.log('Testing Indonesian TTS with voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      toast({
        title: "Tidak ada Indonesian Voice",
        description: "Device ini tidak memiliki voice Indonesia untuk TTS.",
        variant: "destructive",
      });
    }
  };

  // Unified voice input function - prioritizes Web Speech API
  const handleVoiceInput = () => {
    if (speechSupported && !isListening && !isRecording) {
      // Use Web Speech API (preferred)
      startWebSpeechRecognition();
    } else if (isListening) {
      // Stop Web Speech API
      stopWebSpeechRecognition();
    } else if (!speechSupported && !isRecording) {
      // Fallback to MediaRecorder + server processing
      startVoiceRecording();
    } else if (isRecording) {
      // Stop MediaRecorder
      stopVoiceRecording();
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
    // Don't hide examples after clicking - keep them visible
  };

  const clearChat = () => {
    setMessages([]);
    setShowExamples(true);
    setSelectedAgent(null);
  };

  const saveChatHistory = async () => {
    if (messages.length === 0) return;

    try {
      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          title: messages[0]?.content.substring(0, 50) + '...' || 'Chat Session',
        }),
      });

      if (response.ok) {
        alert('Chat berhasil disimpan!');
      }
    } catch (error) {
      console.error('Save chat error:', error);
      alert('Gagal menyimpan chat.');
    }
  };

  const AgentSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={selectedAgent === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAgent(null)}
              className="text-xs"
            >
              <Bot className="h-3 w-3 mr-1" />
              Auto
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" sideOffset={8} avoidCollisions={true}>
            <div className="max-w-xs text-center">
              <p className="font-medium">Auto Agent Selection</p>
              <p className="text-xs opacity-80 mt-1">AI akan otomatis memilih agent yang paling sesuai dengan pertanyaan Anda</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {agents.map((agent) => {
        const Icon = agentIcons[agent.type as keyof typeof agentIcons];
        return (
          <TooltipProvider key={agent.type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedAgent === agent.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgent(agent.type)}
                  className={cn("text-xs", selectedAgent === agent.type && agentColors[agent.type as keyof typeof agentColors])}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {agent.name.split(' ')[0]}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" sideOffset={8} avoidCollisions={true}>
                <div className="max-w-xs text-center">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs opacity-80 mt-1">{agent.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {agent.expertise.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  
  const ExampleQuestionsFixed = () => {
    const currentExamples = selectedAgent 
      ? exampleQuestions[selectedAgent] || []
      : Object.values(exampleQuestions).flat().slice(0, 8);

    return (
      <div className="space-y-3">
        {selectedAgent && (
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Pertanyaan untuk {agents.find(a => a.type === selectedAgent)?.name}
          </div>
        )}
        <div className="grid gap-2">
          {currentExamples.slice(0, 6).map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className="text-left justify-start h-auto p-3 text-xs hover:bg-accent/50 transition-colors"
              onClick={() => handleExampleClick(question)}
            >
              <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0 opacity-60" />
              <span className="line-clamp-2">{question}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const ChatMessage = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const agent = agents.find(a => a.type === message.agentType);
    const AgentIcon = message.agentType ? agentIcons[message.agentType as keyof typeof agentIcons] : Bot;

    return (
      <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : agentColors[message.agentType as keyof typeof agentColors] || "bg-muted"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <AgentIcon className="h-4 w-4" />}
        </div>
        
        <div className={cn("flex-1 max-w-[80%]", isUser && "text-right")}>
          <div className={cn(
            "rounded-lg p-3 text-sm",
            isUser 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted"
          )}>
            {!isUser && agent && (
              <div className="text-xs font-medium mb-1 opacity-80">
                {agent.name}
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.metadata?.sources && message.metadata.sources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.metadata.sources.map((source, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <FileText className="h-2 w-2 mr-1" />
                    {source}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(message.timestamp).toLocaleTimeString('id-ID')}
            {message.metadata?.confidence && (
              <span className="ml-2">
                Confidence: {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Chat AI</h1>
          <p className="text-muted-foreground">
            Konsultasi dengan AI agents spesialis untuk berbagai kebutuhan bisnis Anda
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chat Area */}
        <div className="w-full">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversation</CardTitle>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVoiceEnabled(!voiceEnabled)}
                          className={cn(
                            voiceEnabled && indonesianVoicesAvailable && "bg-green-50 border-green-200",
                            voiceEnabled && !indonesianVoicesAvailable && "bg-yellow-50 border-yellow-200"
                          )}
                        >
                          {voiceEnabled ? (
                            <Volume2 className={cn(
                              "h-4 w-4",
                              indonesianVoicesAvailable ? "text-green-600" : "text-yellow-600"
                            )} />
                          ) : (
                            <VolumeX className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        <div className="text-center max-w-xs">
                          <p className="font-medium">
                            {voiceEnabled ? 'Disable' : 'Enable'} Text-to-Speech
                          </p>
                          <p className="text-xs opacity-80 mt-1">
                            AI responses akan {voiceEnabled ? 'tidak ' : ''}dibacakan
                          </p>
                          {voiceEnabled && (
                            <p className={cn(
                              "text-xs mt-1 font-medium",
                              indonesianVoicesAvailable ? "text-green-600" : "text-yellow-600"
                            )}>
                              {indonesianVoicesAvailable ? 
                                "✓ Indonesian voice tersedia" : 
                                "⚠ Indonesian voice tidak tersedia"
                              }
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Stop TTS Button - only show when speaking */}
                  {isSpeaking && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopTextToSpeech}
                            className="animate-pulse"
                          >
                            <VolumeX className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          <div className="text-center">
                            <p className="font-medium">Stop Text-to-Speech</p>
                            <p className="text-xs opacity-80">Hentikan pembacaan AI</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={saveChatHistory} disabled={messages.length === 0}>
                    <History className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={clearChat} disabled={messages.length === 0}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <AgentSelector />
            </CardHeader>
            
            <Separator />
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {messages.length === 0 && showExamples ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Selamat Datang di Chat AI</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Pilih agent specialist atau ajukan pertanyaan langsung. AI akan otomatis menentukan agent yang tepat untuk membantu Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              AI sedang memproses...
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            
            <Separator />
            
            {/* Input Area */}
            <div className="p-4 flex-shrink-0">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={(isRecording || isListening) ? "destructive" : "outline"}
                        size="sm"
                        onClick={handleVoiceInput}
                        disabled={isLoading}
                        className="flex-shrink-0"
                      >
                        {(isRecording || isListening) ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" sideOffset={8} avoidCollisions={true}>
                      <div className="text-center">
                        <p className="font-medium">
                          {speechSupported ? (
                            isListening ? 'Stop Voice Recognition' : 'Start Voice Recognition'
                          ) : (
                            isRecording ? 'Stop Audio Recording' : 'Start Audio Recording'
                          )}
                        </p>
                        <p className="text-xs opacity-80 mt-1">
                          {speechSupported ? (
                            isListening ? 'Menghentikan pengenalan suara' : 'Bicara dalam Bahasa Indonesia'
                          ) : (
                            isRecording ? 'Menghentikan perekaman' : 'Merekam untuk diproses server'
                          )}
                        </p>
                        {speechStatus === 'listening' && (
                          <p className="text-xs text-blue-400 mt-1 font-medium">🎤 Listening...</p>
                        )}
                        {speechStatus === 'processing' && (
                          <p className="text-xs text-yellow-400 mt-1 font-medium">⚡ Processing...</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik pertanyaan Anda atau gunakan voice input..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading || isRecording || isListening}
                  className="flex-1"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isRecording || isListening}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {(isRecording || isListening || speechStatus !== 'idle') && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    speechStatus === 'listening' && "bg-blue-500 animate-pulse",
                    speechStatus === 'processing' && "bg-yellow-500 animate-bounce",
                    speechStatus === 'error' && "bg-red-500",
                    isRecording && "bg-red-500 animate-pulse"
                  )} />
                  <span className={cn(
                    speechStatus === 'listening' && "text-blue-600",
                    speechStatus === 'processing' && "text-yellow-600",
                    speechStatus === 'error' && "text-red-600",
                    isRecording && "text-red-600"
                  )}>
                    {speechStatus === 'listening' && "🎤 Mendengarkan... Silakan bicara sekarang"}
                    {speechStatus === 'processing' && "⚡ Memproses suara..."}
                    {speechStatus === 'error' && "❌ Tidak ada suara terdeteksi. Coba lagi."}
                    {isRecording && "🔴 Merekam audio... Klik stop untuk selesai"}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Agents and Examples Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Agents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih agent specialist untuk konsultasi yang lebih focused
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {agents.map((agent) => {
                  const Icon = agentIcons[agent.type as keyof typeof agentIcons];
                  const isSelected = selectedAgent === agent.type;
                  
                  return (
                    <div
                      key={agent.type}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors hover:shadow-sm",
                        isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                      )}
                      onClick={() => setSelectedAgent(isSelected ? null : agent.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          agentColors[agent.type as keyof typeof agentColors]
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {agent.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.expertise.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Example Questions - Always Visible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Contoh Pertanyaan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Klik pertanyaan di bawah untuk memulai atau melanjutkan conversation
              </p>
            </CardHeader>
            <CardContent>
              <ExampleQuestionsFixed />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}