import { UserPreferences, UserProfile } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export class UserPreferencesService {
  constructor(private readonly userRepository: IUserRepository) {}

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await this.userRepository.updatePreferences(userId, preferences);
    } catch (error) {
      throw new ApplicationError('PREFERENCES_UPDATE_FAILED', 'Failed to update user preferences', error);
    }
  }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      await this.userRepository.updateProfile(userId, profile);
    } catch (error) {
      throw new ApplicationError('PROFILE_UPDATE_FAILED', 'Failed to update user profile', error);
    }
  }
}
