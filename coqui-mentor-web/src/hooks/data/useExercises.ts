import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => mockApi.getExercises(),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => mockApi.getExerciseById(id),
    enabled: !!id,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}
