import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';

export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => mockApi.getUserProgress(),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => mockApi.getPracticeSessions(),
  });
}
