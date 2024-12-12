'use client';

import { createContext, useContext, ReactNode } from 'react';
import { GetWodUseCase } from '@/application/useCases/wod/GetWodUseCase';
import { CreateWodUseCase } from '@/application/useCases/wod/CreateWodUseCase';
import { useRepositories } from './RepositoryProvider';

interface UseCaseContextType {
  getWodUseCase: GetWodUseCase;
  createWodUseCase: CreateWodUseCase;
}

const UseCaseContext = createContext<UseCaseContextType | undefined>(undefined);

export function UseCaseProvider({ children }: { children: ReactNode }) {
  const { wodRepository } = useRepositories();

  const useCases = {
    getWodUseCase: new GetWodUseCase(wodRepository),
    createWodUseCase: new CreateWodUseCase(wodRepository),
  };

  return (
    <UseCaseContext.Provider value={useCases}>
      {children}
    </UseCaseContext.Provider>
  );
}

export function useUseCases() {
  const context = useContext(UseCaseContext);
  if (context === undefined) {
    throw new Error('useUseCases must be used within a UseCaseProvider');
  }
  return context;
}
