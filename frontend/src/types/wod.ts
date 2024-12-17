import { FirebaseDocument } from './firebase';

export type WodLevel = 'rx' | 'advanced' | 'intermediate' | 'beginner';
export type WodType = 'for_time' | 'amrap';

export interface Wod extends FirebaseDocument {
  title?: string;
  description?: string;
  date: Date;
  rx: string;
  advanced: string;
  intermediate: string;
  beginner: string;
  type: WodType;
  timeLimit?: number;
  points?: number;
}

export interface WodResult extends FirebaseDocument {
  wodId: string;
  userId: string;
  level: WodLevel;
  time?: number;
  rounds?: number;
  notes?: string;
  points?: number;
}

export interface CreateWodRequest {
  title?: string;
  description?: string;
  date: Date;
  rx: string;
  advanced: string;
  intermediate: string;
  beginner: string;
  type: WodType;
  timeLimit?: number;
  points?: number;
}

export interface SubmitWodResultRequest {
  wodId: string;
  level: WodLevel;
  time?: number;
  rounds?: number;
  notes?: string;
}
