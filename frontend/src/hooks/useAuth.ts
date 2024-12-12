'use client';

import { useState, useEffect } from 'react';
import { User, AuthError } from '@/domain/entities/User';
import { authService } from '@/services/auth/auth.service';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const user = await authService.getCurrentUser();
          setState({
            user,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? { code: 'auth/error', message: error.message } : null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? { code: 'auth/error', message: error.message } : null,
      }));
    }
  };

  return {
    ...state,
    signOut,
  };
}
