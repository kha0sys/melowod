import { Wod } from '../entities/Wod';

export interface IWodRepository {
  getById(id: string): Promise<Wod | null>;
  getAll(): Promise<Wod[]>;
  create(wod: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wod>;
  update(id: string, wod: Partial<Wod>): Promise<Wod>;
  delete(id: string): Promise<void>;
  getByType(type: Wod['type']): Promise<Wod[]>;
  getByDifficulty(difficulty: Wod['difficulty']): Promise<Wod[]>;
  search(query: string): Promise<Wod[]>;
}
