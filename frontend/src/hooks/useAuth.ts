import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '@/services/auth/auth.service';
import { AuthState, AuthError } from '@/types/auth';

export interface AuthState {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  } | null;
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
    const unsubscribe = authService.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        // Get additional user data from Firestore
        const userData = await authService.getUserData(user.uid);
        setState(prev => ({
          ...prev,
          user: {
            id: user.uid,
            email: user.email || '',
            emailVerified: user.emailVerified,
            ...userData,
          },
          loading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: null,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setState(prev => ({
        ...prev,
        user: null,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
      }));
    }
  };

  return {
    ...state,
    signOut: handleSignOut,
  };
}
