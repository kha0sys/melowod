import { IUserStatsRepository, UserStats } from '../../../domain/repositories/IUserStatsRepository';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export interface UserAnalytics {
  stats: UserStats;
  recentActivity: any[]; // TODO: Define activity type
  achievements: any[]; // TODO: Define achievement type
}

export class UserAnalyticsService {
  constructor(private readonly userStatsRepository: IUserStatsRepository) {}

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const stats = await this.userStatsRepository.get(userId);
      
      return {
        stats,
        recentActivity: [], // TODO: Implement recent activity logic
        achievements: [], // TODO: Implement achievements logic
      };
    } catch (error) {
      throw new ApplicationError('ANALYTICS_FETCH_FAILED', 'Failed to fetch user analytics', error);
    }
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    try {
      await this.userStatsRepository.update(userId, stats);
    } catch (error) {
      throw new ApplicationError('STATS_UPDATE_FAILED', 'Failed to update user stats', error);
    }
  }
}
