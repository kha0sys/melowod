import { User } from '@/types/user';

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  category: string;
  box?: string;
  level?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthError {
  code?: string;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  gender?: string;
  category?: string;
  box?: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
}
