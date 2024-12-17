'use client';

import { ReactNode } from 'react';
import { RepositoryProvider } from '@/lib/providers/RepositoryProvider';
import { UseCaseProvider } from '@/lib/providers/UseCaseProvider';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <RepositoryProvider>
      <UseCaseProvider>
        {children}
        <Toaster />
      </UseCaseProvider>
    </RepositoryProvider>
  );
}
