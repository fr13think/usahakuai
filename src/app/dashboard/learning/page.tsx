"use client";

import Image from "next/image";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, GraduationCap, Sparkles, Loader2, Volume2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { CourseReader } from "@/components/learning/course-reader";
import { AudiobookPlayerComponent } from "@/components/learning/audiobook-player";
import { getIconForContent, generateSafeIcon } from "@/lib/icon-generator";

interface AudiobookData {
  id: string;
  title: string;
  description: string;
  content: string;
  audio_url?: string | null;
  duration_minutes?: number | null;
  play_count?: number;
  created_at: string;
}

interface Chapter {
  title: string;
  content: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  content: string;
  chapters?: Chapter[];
  progress_percentage?: number;
  is_completed?: boolean;
  created_at: string;
}

type ViewMode = 'list' | 'audiobook' | 'course';

interface ViewState {
  mode: ViewMode;
  selectedAudiobook?: AudiobookData;
  selectedCourse?: CourseData;
}

const getImageForContent = (title: string, contentType: 'audiobook' | 'course') => {
    const iconConfig = getIconForContent(title);
    const iconUrl = generateSafeIcon(iconConfig, 400);
    return {
        imageUrl: iconUrl,
        imageHint: `Generated icon for ${title}`,
        id: `generated-${contentType}-${Math.random()}`
    };
}

export default function LearningPage() {
    const { toast } = useToast();
    const [audiobooks, setAudiobooks] = React.useState<AudiobookData[]>([]);
    const [courses, setCourses] = React.useState<CourseData[]>([]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [viewState, setViewState] = React.useState<ViewState>({ mode: 'list' });

    // Load learning content from database
    const loadLearningContent = async () => {
        try {
            const response = await fetch('/api/learning');
            const result = await response.json();
            
            if (result.success) {
                setAudiobooks(result.data.audiobooks || []);
                setCourses(result.data.courses || []);
            } else {
                console.error('Failed to load learning content:', result.error);
            }
        } catch (error) {
            console.error('Error loading learning content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    React.useEffect(() => {
        loadLearningContent();
    }, []);

    const handlePlayAudiobook = (audiobook: AudiobookData) => {
        setViewState({ mode: 'audiobook', selectedAudiobook: audiobook });
    };

    const handleReadCourse = (course: CourseData) => {
        setViewState({ mode: 'course', selectedCourse: course });
    };

    const handleBackToList = () => {
        setViewState({ mode: 'list' });
    };

    const handlePlayCountUpdate = async (audiobookId: string) => {
        // Update play count in backend (optional - for analytics)
        try {
            await fetch('/api/learning/audiobooks/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audiobookId })
            });
        } catch (error) {
            console.error('Failed to update play count:', error);
        }
    };

    const handleProgressUpdate = async (courseId: string, progress: number) => {
        try {
            await fetch('/api/learning/courses/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, progress })
            });
            
            // Update local state
            setCourses(prev => prev.map(course => 
                course.id === courseId 
                    ? { ...course, progress_percentage: progress, is_completed: progress >= 100 }
                    : course
            ));
        } catch (error) {
            console.error('Failed to update course progress:', error);
        }
    };

    const handleGenerateContent = async (contentType: 'audiobook' | 'course') => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/learning/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType })
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (contentType === 'audiobook') {
                    setAudiobooks(prev => [...prev, result.data]);
                } else {
                    setCourses(prev => [...prev, result.data]);
                }
                toast({
                    title: "Konten Baru Dihasilkan!",
                    description: `Konten baru "${result.data.title}" telah ditambahkan.`,
                });
            } else {
                throw new Error(result.error || 'Failed to generate content');
            }
        } catch (error) {
            console.error("Failed to generate content", error);
            toast({
                variant: 'destructive',
                title: "Gagal Menghasilkan Konten",
                description: "Terjadi kesalahan saat mencoba membuat konten baru. Silakan coba lagi.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Render different views based on mode
    if (viewState.mode === 'audiobook' && viewState.selectedAudiobook) {
        return (
            <AudiobookPlayerComponent 
                audiobook={viewState.selectedAudiobook}
                onClose={handleBackToList}
                onPlayCountUpdate={handlePlayCountUpdate}
            />
        );
    }

    if (viewState.mode === 'course' && viewState.selectedCourse) {
        return (
            <CourseReader 
                course={viewState.selectedCourse}
                onClose={handleBackToList}
                onProgressUpdate={handleProgressUpdate}
            />
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-8 p-4 md:p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline">Pusat Belajar</h1>
                    <p className="text-muted-foreground">
                        Sedang memuat konten pembelajaran...
                    </p>
                </div>
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Pusat Belajar</h1>
        <p className="text-muted-foreground">
          Tingkatkan pengetahuan dan keterampilan bisnis Anda di sini.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-headline">Audiobook Bisnis</h2>
            <Button onClick={() => handleGenerateContent('audiobook')} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {audiobooks.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Volume2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Belum ada audiobook. Klik &quot;Generate&quot; untuk membuat audiobook baru.
              </p>
            </div>
          ) : (
            audiobooks.map((book) => {
              const image = getImageForContent(book.title, 'audiobook');
              return (
                <Card key={book.id}>
                   <div className="relative h-48 w-full">
                      <Image
                          src={image.imageUrl}
                          alt={book.title}
                          fill
                          className="object-cover rounded-t-lg"
                          data-ai-hint={image.imageHint}
                      />
                   </div>
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                    <CardDescription>{book.description}</CardDescription>
                    {book.play_count && book.play_count > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Diputar {book.play_count} kali
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handlePlayAudiobook(book)}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Mulai Dengarkan
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-headline">Kursus Interaktif</h2>
             <Button onClick={() => handleGenerateContent('course')} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {courses.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Belum ada kursus. Klik &quot;Generate&quot; untuk membuat kursus baru.
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const image = getImageForContent(course.title, 'course');
              const progress = course.progress_percentage || 0;
              return (
                <Card key={course.id}>
                  <div className="relative h-48 w-full">
                     <Image
                         src={image.imageUrl}
                         alt={course.title}
                         fill
                         className="object-cover rounded-t-lg"
                         data-ai-hint={image.imageHint}
                     />
                  </div>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    {progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        {course.is_completed && (
                          <div className="flex items-center text-sm text-green-600">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Selesai
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleReadCourse(course)}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {progress > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
