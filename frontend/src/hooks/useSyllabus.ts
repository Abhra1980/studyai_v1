import { useQuery } from '@tanstack/react-query';
import { syllabusService } from '@/services/syllabusService';
import type { MainTopic, Topic, SearchResult } from '@/types/syllabus';

export function useSyllabus() {
  return useQuery<MainTopic[]>({
    queryKey: ['syllabus'],
    queryFn: () => syllabusService.listMainTopics(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useMainTopic(id: number) {
  return useQuery<MainTopic | null>({
    queryKey: ['main-topic', id],
    queryFn: () => syllabusService.getMainTopic(id),
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
  });
}

export function useTopic(id: number) {
  return useQuery<Topic | null>({
    queryKey: ['topic', id],
    queryFn: () => syllabusService.getTopic(id),
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
  });
}

export function useSearchTopics(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: () => syllabusService.searchTopics(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => syllabusService.getHealth(),
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}
