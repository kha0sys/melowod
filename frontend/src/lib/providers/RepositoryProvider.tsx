'use client';

import { createContext, useContext, ReactNode } from 'react';
import { IWodRepository } from '@/domain/repositories/IWodRepository';
import { FirebaseWodRepository } from '@/infrastructure/repositories/FirebaseWodRepository';

interface RepositoryContextType {
  wodRepository: IWodRepository;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const wodRepository = new FirebaseWodRepository();

  return (
    <RepositoryContext.Provider value={{ wodRepository }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepositories must be used within a RepositoryProvider');
  }
  return context;
}
