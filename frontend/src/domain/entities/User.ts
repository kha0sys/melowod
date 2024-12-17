export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  category: string;
  city: string;
  country: string;
  gender: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  points: number;
  achievements: string[];
  isEmailVerified: boolean;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
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
  phoneNumber: string;
  category: string;
  city: string;
  country: string;
  gender: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}
