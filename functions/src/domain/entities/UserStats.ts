import { WodResult } from './Wod';

export interface UserStats {
  userId: string;
  totalWods: number;
  completedWods: number;
  points: number;
  rxCount: number;
  scaledCount: number;
  beginnerCount: number;
  personalBests: { [wodId: string]: { score: number; date: Date } };
  lastUpdated: Date;
}

export interface IUserStatsRepository {
  get(userId: string): Promise<UserStats>;
  update(userId: string, stats: Partial<UserStats>): Promise<void>;
  calculateStats(userId: string): Promise<UserStats>;
  addResult(userId: string, result: WodResult): Promise<void>;
}
