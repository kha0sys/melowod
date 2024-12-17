import { UserManagementService } from '../UserManagementService';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../../../domain/entities/User';
import { ApplicationError } from '../../../shared/errors/ApplicationError';

describe('UserManagementService', () => {
  let userService: UserManagementService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByEmail: jest.fn(),
      list: jest.fn(),
      updatePreferences: jest.fn(),
      updateProfile: jest.fn()
    } as unknown as jest.Mocked<IUserRepository>;

    userService = new UserManagementService(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'athlete' as UserRole,
        preferences: {
          notifications: {
            email: true,
            push: true,
            wodReminders: true,
            leaderboardUpdates: true
          },
          privacySettings: {
            showProfile: true,
            showResults: true,
            showStats: true
          },
          measurementUnit: 'metric'
        },
        profile: {
          experience: 'beginner'
        }
      };

      mockUserRepository.create.mockResolvedValue('123');

      const result = await userService.createUser(mockUser);

      expect(result).toBe('123');
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error for invalid user data', async () => {
      const invalidUser = {
        email: 'test@example.com',
        displayName: 'Test User'
      };

      await expect(userService.createUser(invalidUser as any)).rejects.toThrow(ApplicationError);
    });
  });

  describe('getUser', () => {
    it('should return user if found', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'athlete' as UserRole,
        preferences: {
          notifications: {
            email: true,
            push: true,
            wodReminders: true,
            leaderboardUpdates: true
          },
          privacySettings: {
            showProfile: true,
            showResults: true,
            showStats: true
          },
          measurementUnit: 'metric'
        },
        profile: {
          experience: 'beginner'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.getById.mockResolvedValue(mockUser);

      const result = await userService.getUser('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.getById.mockResolvedValue(null);
      await expect(userService.getUser('123')).rejects.toThrow(ApplicationError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdate: Partial<User> = {
        displayName: 'Updated Name',
        profile: {
          experience: 'intermediate'
        }
      };

      await userService.updateUser('123', mockUpdate);
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', mockUpdate);
    });
  });
});
