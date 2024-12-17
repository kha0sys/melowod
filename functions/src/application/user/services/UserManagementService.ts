import { User, UserFilters } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { UserValidator } from '../../../domain/validators/UserValidator';

export class UserManagementService {
  private validator: UserValidator;

  constructor(private readonly userRepository: IUserRepository) {
    this.validator = new UserValidator();
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Validar datos de usuario
      const validationResult = this.validator.validate(user);
      validationResult.throwIfInvalid();

      return await this.userRepository.create(user);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new ApplicationError('INVALID_USER_DATA', error.message);
      }
      throw new ApplicationError('USER_CREATION_FAILED', 'Failed to create user', String(error));
    }
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', `User with id ${userId} not found`);
    }
    return user;
  }

  async updateUser(userId: string, user: Partial<User>): Promise<void> {
    try {
      // Validar datos de actualización
      const validationResult = this.validator.validate(user);
      validationResult.throwIfInvalid();

      await this.userRepository.update(userId, user);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new ApplicationError('INVALID_USER_DATA', error.message);
      }
      throw new ApplicationError('USER_UPDATE_FAILED', 'Failed to update user', String(error));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.userRepository.delete(userId);
    } catch (error: unknown) {
      throw new ApplicationError('USER_DELETION_FAILED', 'Failed to delete user', String(error));
    }
  }

  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      return await this.userRepository.list(filters);
    } catch (error: unknown) {
      throw new ApplicationError('USER_FETCH_FAILED', 'Failed to fetch users', String(error));
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.getByEmail(email);
    } catch (error: unknown) {
      throw new ApplicationError('USER_FETCH_FAILED', 'Failed to fetch user by email', String(error));
    }
  }

  async updateUserPreferences(userId: string, preferences: User['preferences']): Promise<void> {
    try {
      await this.userRepository.updatePreferences(userId, preferences);
    } catch (error: unknown) {
      throw new ApplicationError('USER_PREFERENCES_UPDATE_FAILED', 'Failed to update user preferences', String(error));
    }
  }

  async updateUserProfile(userId: string, profile: User['profile']): Promise<void> {
    try {
      await this.userRepository.updateProfile(userId, profile);
    } catch (error: unknown) {
      throw new ApplicationError('USER_PROFILE_UPDATE_FAILED', 'Failed to update user profile', String(error));
    }
  }
}
