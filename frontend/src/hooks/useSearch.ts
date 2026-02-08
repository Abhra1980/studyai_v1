import { useState, useEffect, useCallback } from 'react';
import { useSearchTopics } from './useSyllabus';

export function useSearch(initialDelay: number = 500) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [searchQuery, initialDelay]);

  // Use the debounced query for actual search
  const { data: results, isLoading, error } = useSearchTopics(debouncedQuery);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    results: results || [],
    isLoading,
    error,
    clearSearch,
    hasResults: (results?.length || 0) > 0,
  };
}
