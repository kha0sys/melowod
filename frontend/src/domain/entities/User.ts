export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  COACH = 'COACH'
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}
