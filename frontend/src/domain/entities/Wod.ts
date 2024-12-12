export interface Wod {
  id: string;
  title: string;
  description: string;
  type: WodType;
  difficulty: WodDifficulty;
  movements: Movement[];
  scoring: ScoringType;
  timeLimit?: number;
  rounds?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type WodType = 'amrap' | 'fortime' | 'emom' | 'tabata' | 'custom';

export type WodDifficulty = 'rx' | 'scaled' | 'beginner';

export interface Movement {
  name: string;
  reps: number;
  weight?: number;
  distance?: number;
  unit?: 'kg' | 'lb' | 'm' | 'cal';
  notes?: string;
}

export type ScoringType = {
  type: 'time' | 'reps' | 'weight' | 'rounds';
  value: number;
};
