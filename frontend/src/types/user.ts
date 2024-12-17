import { FirebaseDocument } from './firebase';

export interface User extends FirebaseDocument {
  name: string;
  email: string;
  box?: string;
  level?: string;
  isEmailVerified?: boolean;
  photoURL?: string;
}

export interface UserStats extends FirebaseDocument {
  userId: string;
  totalWods: number;
  completedWods: number;
  points: number;
  rank: number;
  level: string;
  boxRank?: number;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  box?: string;
  level?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AuthError = {
  code: string;
  message: string;
}
