import { Wod } from './Wod';

export interface UserActivity {
  id: string;
  userId: string;
  type: 'wod_completion' | 'achievement_unlocked' | 'level_up';
  data: {
    wodResult?: {
      wodId: string;
      wod: Wod;
      score: number;
      rx: boolean;
    };
    achievement?: {
      id: string;
      name: string;
    };
    levelUp?: {
      from: string;
      to: string;
    };
  };
  createdAt: Date;
}
