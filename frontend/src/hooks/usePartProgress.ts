import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syllabusService } from '@/services/syllabusService';

const QUERY_KEY = ['part-progress'];

export function usePartProgress() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => syllabusService.getPartProgress(),
    staleTime: 1000 * 30,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  return {
    partProgress: data ?? [],
    isLoading,
    invalidate,
  };
}
