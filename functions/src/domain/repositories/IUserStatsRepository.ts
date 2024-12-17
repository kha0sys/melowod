export interface UserStats {
  userId: string;
  totalWods: number;
  completedWods: number;
  points: number;
  rxCount: number;
  scaledCount: number;
  beginnerCount: number;
  personalBests: Record<string, number>;
  lastUpdated: Date;
}

export interface IUserStatsRepository {
  get(userId: string): Promise<UserStats>;
  update(userId: string, stats: Partial<UserStats>): Promise<void>;
  calculateStats(userId: string): Promise<UserStats>;
}
