import { Wod, WodResult, WodFilters } from '../../domain/entities/Wod';
import { UserStats } from '../../domain/repositories/IUserStatsRepository';
import { wodRepository } from '../../infrastructure/repositories/WodRepository';
import { wodResultRepository } from '../../infrastructure/repositories/WodResultRepository';
import { userStatsRepository } from '../../infrastructure/repositories/UserStatsRepository';

export class WodService {
  private static instance: WodService;

  private constructor() {}

  public static getInstance(): WodService {
    if (!WodService.instance) {
      WodService.instance = new WodService();
    }
    return WodService.instance;
  }

  // WOD Management
  async createWod(wod: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return wodRepository.create(wod);
  }

  async getWod(wodId: string): Promise<Wod | null> {
    return wodRepository.getById(wodId);
  }

  async updateWod(wodId: string, wod: Partial<Wod>): Promise<void> {
    return wodRepository.update(wodId, wod);
  }

  async deleteWod(wodId: string): Promise<void> {
    return wodRepository.delete(wodId);
  }

  async listWods(filters?: WodFilters): Promise<Wod[]> {
    return wodRepository.list(filters);
  }

  // WOD Results
  async submitResult(result: Omit<WodResult, 'id' | 'createdAt'>): Promise<string> {
    const resultId = await wodResultRepository.create(result);
    await this.updateUserStats(result.userId);
    return resultId;
  }

  async getUserResults(userId: string): Promise<WodResult[]> {
    return wodResultRepository.getByUser(userId);
  }

  async getWodResults(wodId: string): Promise<WodResult[]> {
    return wodResultRepository.getByWod(wodId);
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats> {
    return userStatsRepository.get(userId);
  }

  async updateUserStats(userId: string): Promise<void> {
    const stats = await userStatsRepository.calculateStats(userId);
    await userStatsRepository.update(userId, stats);
  }

  // Leaderboard
  async getLeaderboard(wodId: string, limit: number = 10): Promise<WodResult[]> {
    const results = await wodResultRepository.getByWod(wodId);
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Analytics
  async getWodCompletion(wodId: string): Promise<{
    total: number;
    byLevel: { rx: number; scaled: number; beginner: number };
    averageScore: number;
  }> {
    const results = await wodResultRepository.getByWod(wodId);
    const byLevel = {
      rx: results.filter(r => r.level === 'rx').length,
      scaled: results.filter(r => r.level === 'scaled').length,
      beginner: results.filter(r => r.level === 'beginner').length
    };

    const averageScore = results.reduce((acc, curr) => acc + curr.score, 0) / results.length;

    return {
      total: results.length,
      byLevel,
      averageScore
    };
  }
}

export const wodService = WodService.getInstance();
