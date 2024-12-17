'use client';

import { ReactNode, useEffect, useState } from 'react';
import { RepositoryProvider } from '@/lib/providers/RepositoryProvider';
import { UseCaseProvider } from '@/lib/providers/UseCaseProvider';
import { Toaster } from '@/components/ui/toaster';
import { validateEnvVars } from '@/config/env';
import { getApps } from 'firebase/app';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Validar variables de entorno y configuración de Firebase
        validateEnvVars();

        // Verificar que Firebase esté inicializado
        if (getApps().length === 0) {
          throw new Error('Firebase no está inicializado');
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error de Inicialización</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-2 text-sm text-gray-500">
            Verifica que todas las variables de entorno estén configuradas correctamente en .env.local
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Cargando...</h1>
          <p className="mt-2 text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <RepositoryProvider>
      <UseCaseProvider>
        {children}
        <Toaster />
      </UseCaseProvider>
    </RepositoryProvider>
  );
}
