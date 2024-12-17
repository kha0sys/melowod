export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  preferences: UserPreferences;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'athlete' | 'coach' | 'admin';

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    wodReminders: boolean;
    leaderboardUpdates: boolean;
  };
  privacySettings: {
    showProfile: boolean;
    showResults: boolean;
    showStats: boolean;
  };
  measurementUnit: 'metric' | 'imperial';
}

export interface UserProfile {
  bio?: string;
  age?: number;
  weight?: number;
  height?: number;
  box?: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  specialties?: string[];
  certifications?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  list(filters?: UserFilters): Promise<User[]>;
  updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<void>;
  updateProfile(id: string, profile: Partial<UserProfile>): Promise<void>;
}

export interface UserFilters {
  role?: UserRole;
  box?: string;
  experience?: UserProfile['experience'];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}
