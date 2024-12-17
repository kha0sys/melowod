import { User, UserFilters, UserPreferences, UserProfile } from '../entities/User';

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getById(userId: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  update(userId: string, user: Partial<User>): Promise<void>;
  delete(userId: string): Promise<void>;
  list(filters?: UserFilters): Promise<User[]>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
  updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void>;
}
