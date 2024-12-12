'use client';

import { ReactNode } from 'react';
import { RepositoryProvider } from '@/lib/providers/RepositoryProvider';
import { UseCaseProvider } from '@/lib/providers/UseCaseProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <RepositoryProvider>
      <UseCaseProvider>
        {children}
      </UseCaseProvider>
    </RepositoryProvider>
  );
}
