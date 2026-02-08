import { useQuery, useQueryClient } from '@tanstack/react-query';
import { progressService } from '@/services/progressService';

export function useProgress() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressService.getProgress(),
    staleTime: 1000 * 30, // 30 seconds
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['progress'] });

  return {
    completed: data?.completed ?? 0,
    total: data?.total ?? 0,
    isLoading,
    invalidate,
  };
}
