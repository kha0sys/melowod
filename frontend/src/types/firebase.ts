import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';

export interface FirebaseDocument {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FirebaseConverter<T extends FirebaseDocument> {
  toFirestore(modelObject: T): DocumentData;
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ): T;
}

export interface FirebaseRepository<T extends FirebaseDocument> {
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
}
