"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle, 
  Circle,
  ArrowLeft 
} from 'lucide-react';

interface Chapter {
  title: string;
  content: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  content: string;
  chapters?: Chapter[];
  progress_percentage?: number;
  is_completed?: boolean;
}

interface CourseReaderProps {
  course: Course;
  onClose?: () => void;
  onProgressUpdate?: (courseId: string, progress: number) => void;
}

export function CourseReader({ course, onClose, onProgressUpdate }: CourseReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(course.progress_percentage || 0);

  // Parse chapters from content if chapters array is not provided
  const chapters: Chapter[] = React.useMemo(() => {
    if (course.chapters && course.chapters.length > 0) {
      return course.chapters;
    }
    
    // Try to parse chapters from content
    const lines = course.content.split('\n');
    const parsedChapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line is a chapter title (starts with "Bab " or "Chapter ")
      if (trimmedLine.match(/^(Bab|Chapter)\s+\d+:/i)) {
        if (currentChapter) {
          parsedChapters.push(currentChapter);
        }
        currentChapter = {
          title: trimmedLine,
          content: ''
        };
      } else if (currentChapter && trimmedLine.length > 0) {
        currentChapter.content += (currentChapter.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentChapter) {
      parsedChapters.push(currentChapter);
    }
    
    // If no chapters were found, create a single chapter from the entire content
    if (parsedChapters.length === 0) {
      parsedChapters.push({
        title: course.title,
        content: course.content
      });
    }
    
    return parsedChapters;
  }, [course.content, course.chapters, course.title]);

  const currentChapter = chapters[currentChapterIndex];
  const totalChapters = chapters.length;

  // Update progress when chapters are completed
  useEffect(() => {
    const newProgress = Math.round((completedChapters.size / totalChapters) * 100);
    if (newProgress !== progress) {
      setProgress(newProgress);
      onProgressUpdate?.(course.id, newProgress);
    }
  }, [completedChapters, totalChapters, progress, course.id, onProgressUpdate]);

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1) {
      // Mark current chapter as completed when moving to next
      setCompletedChapters(prev => new Set([...prev, currentChapterIndex]));
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
  };

  const toggleChapterCompletion = (index: number) => {
    setCompletedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isChapterCompleted = (index: number) => completedChapters.has(index);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar with chapter list */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Daftar Bab</CardTitle>
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Progress: {progress}% ({completedChapters.size}/{totalChapters} bab selesai)
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => toggleChapterCompletion(index)}
                      >
                        {isChapterCompleted(index) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant={currentChapterIndex === index ? "secondary" : "ghost"}
                        className="justify-start flex-1 h-auto p-2 text-left"
                        onClick={() => handleChapterSelect(index)}
                      >
                        <div>
                          <div className="font-medium text-sm">
                            Bab {index + 1}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {chapter.title.replace(/^(Bab|Chapter)\s+\d+:\s*/i, '')}
                          </div>
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-xl">{currentChapter.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Bab {currentChapterIndex + 1} dari {totalChapters}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousChapter}
                    disabled={currentChapterIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === totalChapters - 1}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {currentChapter.content.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    return (
                      <p key={index} className="mb-4 leading-relaxed text-justify">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </ScrollArea>
              
              {/* Chapter navigation at bottom */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousChapter}
                  disabled={currentChapterIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Bab Sebelumnya</span>
                </Button>

                <div className="flex items-center space-x-4">
                  <Button
                    variant={isChapterCompleted(currentChapterIndex) ? "default" : "outline"}
                    onClick={() => toggleChapterCompletion(currentChapterIndex)}
                    className="flex items-center space-x-2"
                  >
                    {isChapterCompleted(currentChapterIndex) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>
                      {isChapterCompleted(currentChapterIndex) ? 'Selesai' : 'Tandai Selesai'}
                    </span>
                  </Button>
                </div>

                <Button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === totalChapters - 1}
                  className="flex items-center space-x-2"
                >
                  <span>Bab Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}