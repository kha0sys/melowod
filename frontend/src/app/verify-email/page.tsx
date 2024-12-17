'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/infrastructure/firebase/auth/auth.service';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    if (!user) return;

    setIsResending(true);
    try {
      // Get the current Firebase user
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      await authService.sendEmailVerification(currentUser);
      toast({
        title: 'Email enviado',
        description: 'Se ha enviado un nuevo correo de verificación',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Verifica tu correo electrónico</h1>
        <p className="mb-8">
          Hemos enviado un correo de verificación a <strong>{user.email}</strong>.
          Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button
          onClick={handleResendVerification}
          disabled={isResending}
          className="bg-coral text-cream px-4 py-2 rounded-md hover:bg-coral/90 disabled:opacity-50"
        >
          {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
        </button>
      </div>
    </div>
  );
}
