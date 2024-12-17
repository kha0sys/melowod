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

export interface WodResult {
  id: string;
  userId: string;
  wodId: string;
  score: number;
  level: WodDifficulty;
  movements: Movement[];
  scoring: ScoringType;
  mediaUrls?: string[];
  notes?: string;
  createdAt: Date;
}

// Repository Interfaces
export interface IWodRepository {
  create(wod: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getById(id: string): Promise<Wod | null>;
  update(id: string, wod: Partial<Wod>): Promise<void>;
  delete(id: string): Promise<void>;
  list(filters?: WodFilters): Promise<Wod[]>;
}

export interface IWodResultRepository {
  create(result: Omit<WodResult, 'id' | 'createdAt'>): Promise<string>;
  getById(id: string): Promise<WodResult | null>;
  getByUser(userId: string): Promise<WodResult[]>;
  getByWod(wodId: string): Promise<WodResult[]>;
}

export interface WodFilters {
  type?: WodType;
  difficulty?: WodDifficulty;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}
