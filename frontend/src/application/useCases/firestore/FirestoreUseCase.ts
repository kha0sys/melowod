import { IFirebaseRepository, QueryConfig } from '@/domain/repositories/IFirebaseRepository';

export class FirestoreUseCase {
  constructor(private readonly firebaseRepository: IFirebaseRepository) {}

  async create<T>(collection: string, data: T, id?: string): Promise<string> {
    return this.firebaseRepository.create(collection, data, id);
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
    return this.firebaseRepository.update(collection, id, data);
  }

  async delete(collection: string, id: string): Promise<void> {
    return this.firebaseRepository.delete(collection, id);
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    return this.firebaseRepository.getById(collection, id);
  }

  async query<T>(collection: string, queries: QueryConfig[]): Promise<T[]> {
    return this.firebaseRepository.query(collection, queries);
  }
}
