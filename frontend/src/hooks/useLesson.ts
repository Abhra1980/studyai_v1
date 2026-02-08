import { useMutation, useQuery } from '@tanstack/react-query';
import { lessonService } from '@/services/lessonService';
import type { Lesson, LearnRequest, CachedContent } from '@/types/lesson';
import { useState, useCallback } from 'react';

export function useCachedLesson(topicId: number) {
  return useQuery<CachedContent | null>({
    queryKey: ['cached-lesson', topicId],
    queryFn: () => lessonService.getCachedLesson(topicId),
    enabled: !!topicId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useGenerateLesson(topicId: number) {
  const [streamedContent, setStreamedContent] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async (request?: LearnRequest) => {
      setStreamedContent('');
      const lesson = await lessonService.generateLesson(topicId, request);
      // Store the explanation as streamed content for display
      if (lesson && lesson.explanation) {
        setStreamedContent(lesson.explanation);
      }
      return lesson;
    },
    onSuccess: (data) => {
      // Full lesson data available after generation completes
      if (data && data.explanation) {
        setStreamedContent(data.explanation);
      }
    },
    onError: (error) => {
      console.error('Lesson generation error:', error);
    },
  });

  return {
    ...mutation,
    streamedContent,
    setStreamedContent,
  };
}

export function useGenerateLessonDirect(topicId: number) {
  return useMutation<Lesson, Error, LearnRequest | undefined>({
    mutationFn: (request) => lessonService.generateLessonDirect(topicId, request),
  });
}

export function useStreamLesson(topicId: number, onChunk?: (chunk: string) => void) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const startStream = useCallback(
    async (request?: LearnRequest) => {
      setIsStreaming(true);
      setStreamedText('');
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/learn/${topicId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: JSON.stringify(request || { user_level: 'intermediate' }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6));
                const text = json.content || '';
                setStreamedText((prev) => prev + text);
                onChunk?.(text);
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Stream failed'));
      } finally {
        setIsStreaming(false);
      }
    },
    [topicId, onChunk]
  );

  return {
    isStreaming,
    streamedText,
    error,
    startStream,
  };
}
