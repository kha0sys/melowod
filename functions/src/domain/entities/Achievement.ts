export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  unlockedAt: Date;
  type: 'wod_completion' | 'streak' | 'personal_record' | 'level_up';
  progress?: {
    current: number;
    required: number;
  };
}
