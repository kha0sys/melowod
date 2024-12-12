import { useState, useCallback } from 'react';
import { Wod } from '@/domain/entities/Wod';
import { FirebaseWodRepository } from '@/infrastructure/repositories/FirebaseWodRepository';
import { GetWodUseCase } from '@/application/useCases/wod/GetWodUseCase';
import { CreateWodUseCase } from '@/application/useCases/wod/CreateWodUseCase';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUseCases } from '@/lib/providers/UseCaseProvider';

const wodRepository = new FirebaseWodRepository();
const getWodUseCase = new GetWodUseCase(wodRepository);
const createWodUseCase = new CreateWodUseCase(wodRepository);

interface UseWodState {
  wod: Wod | null;
  loading: boolean;
  error: Error | null;
}

export function useWod(wodId?: string) {
  const queryClient = useQueryClient();
  const { getWodUseCase, createWodUseCase } = useUseCases();

  const {
    data: wod,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['wod', wodId],
    queryFn: () => getWodUseCase.execute(wodId!),
    enabled: !!wodId,
  });

  const createMutation = useMutation({
    mutationFn: (wodData: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>) =>
      createWodUseCase.execute(wodData),
    onSuccess: (newWod) => {
      queryClient.setQueryData(['wod', newWod.id], newWod);
      queryClient.invalidateQueries({ queryKey: ['wods'] });
    },
  });

  return {
    wod,
    loading: loading || createMutation.isPending,
    error: error || createMutation.error,
    createWod: createMutation.mutate,
  };
}
