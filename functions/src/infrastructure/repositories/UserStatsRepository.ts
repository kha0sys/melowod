import { db } from '../firebase/admin';
import { WodResult } from '../../domain/entities/Wod';
import { IUserStatsRepository, UserStats } from '../../domain/entities/UserStats';

export class UserStatsRepository implements IUserStatsRepository {
  private static instance: UserStatsRepository;
  private constructor() {}

  public static getInstance(): UserStatsRepository {
    if (!UserStatsRepository.instance) {
      UserStatsRepository.instance = new UserStatsRepository();
    }
    return UserStatsRepository.instance;
  }

  async get(userId: string): Promise<UserStats> {
    const statsDoc = await db.collection('userStats').doc(userId).get();
    if (!statsDoc.exists) {
      // Return default stats for new users
      return {
        userId,
        totalWods: 0,
        completedWods: 0,
        points: 0,
        rxCount: 0,
        scaledCount: 0,
        beginnerCount: 0,
        personalBests: {},
        lastUpdated: new Date()
      };
    }
    return statsDoc.data() as UserStats;
  }

  async update(userId: string, stats: Partial<UserStats>): Promise<void> {
    const now = new Date();
    await db.collection('userStats').doc(userId).set({
      ...stats,
      lastUpdated: now
    }, { merge: true });
  }

  async calculateStats(userId: string): Promise<UserStats> {
    const resultsSnapshot = await db.collection('wodResults')
      .where('userId', '==', userId)
      .get();
    
    const results = resultsSnapshot.docs.map(doc => doc.data() as WodResult);
    const personalBests: { [wodId: string]: { score: number; date: Date } } = {};
    
    // Initialize stats
    const stats: UserStats = {
      userId,
      totalWods: results.length,
      completedWods: results.length,
      points: 0,
      rxCount: 0,
      scaledCount: 0,
      beginnerCount: 0,
      personalBests: {},
      lastUpdated: new Date()
    };

    // Calculate stats from results
    results.forEach(result => {
      // Count by level
      switch (result.level) {
        case 'rx':
          stats.rxCount++;
          stats.points += 10;
          break;
        case 'scaled':
          stats.scaledCount++;
          stats.points += 5;
          break;
        case 'beginner':
          stats.beginnerCount++;
          stats.points += 3;
          break;
      }

      // Update personal bests
      const currentBest = stats.personalBests[result.wodId];
      if (!currentBest || result.score > currentBest.score) {
        stats.personalBests[result.wodId] = {
          score: result.score,
          date: result.createdAt
        };
      }
    });

    // Update stats in Firestore
    await this.update(userId, stats);

    return stats;
  }

  async addResult(userId: string, result: WodResult): Promise<void> {
    // Get current stats
    const currentStats = await this.get(userId);
    
    // Update stats based on the new result
    const stats: Partial<UserStats> = {
      totalWods: currentStats.totalWods + 1,
      completedWods: currentStats.completedWods + 1,
      points: currentStats.points,
      rxCount: currentStats.rxCount,
      scaledCount: currentStats.scaledCount,
      beginnerCount: currentStats.beginnerCount,
      personalBests: { ...currentStats.personalBests }
    };

    // Update counts and points based on level
    switch (result.level) {
      case 'rx':
        stats.rxCount!++;
        stats.points! += 10;
        break;
      case 'scaled':
        stats.scaledCount!++;
        stats.points! += 5;
        break;
      case 'beginner':
        stats.beginnerCount!++;
        stats.points! += 3;
        break;
    }

    // Update personal best if applicable
    const currentBest = stats.personalBests![result.wodId];
    if (!currentBest || result.score > currentBest.score) {
      stats.personalBests![result.wodId] = {
        score: result.score,
        date: result.createdAt
      };
    }

    // Update the stats in Firestore
    await this.update(userId, stats);
  }
}

export const userStatsRepository = UserStatsRepository.getInstance();
