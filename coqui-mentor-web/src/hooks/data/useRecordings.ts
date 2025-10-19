import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import type { Recording } from '../../types/exercise.types';

export function useRecordings() {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: () => mockApi.getRecordings(),
  });
}

export function useSaveRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recording: Omit<Recording, 'id'>) => mockApi.saveRecording(recording),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApi.deleteRecording(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });
}
