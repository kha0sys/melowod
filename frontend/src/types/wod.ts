export interface Wod {
  id: string;
  date: string;
  rx: string;
  advanced: string;
  intermediate: string;
  beginner: string;
  type: 'for_time' | 'amrap';
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WodResult {
  id: string;
  wodId: string;
  userId: string;
  level: 'rx' | 'advanced' | 'intermediate' | 'beginner';
  time?: number;
  rounds?: number;
  notes?: string;
  createdAt: string;
}
