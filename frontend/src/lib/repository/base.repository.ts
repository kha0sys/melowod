import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  DocumentData,
  QueryConstraint,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { firestoreCache } from '@/lib/firebase/cache';

export class BaseRepository<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  async getById(id: string, options?: { forceFetch?: boolean }): Promise<T | null> {
    return firestoreCache.getDocument<T>(this.getDocRef(id), options);
  }

  async getMany(queryConstraints: QueryConstraint[] = [], options?: { forceFetch?: boolean }): Promise<T[]> {
    return firestoreCache.getCollection<T>(this.getCollectionRef(), queryConstraints, options);
  }

  async create(id: string, data: T): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const docRef = this.getDocRef(id);
      const docSnap = await transaction.get(docRef);
      
      if (docSnap.exists()) {
        throw new Error(`Document ${id} already exists in ${this.collectionName}`);
      }

      transaction.set(docRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = this.getDocRef(id);
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document ${id} does not exist in ${this.collectionName}`);
      }

      transaction.update(docRef, {
        ...data,
        updatedAt: new Date()
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.getDocRef(id).delete();
  }

  async batchOperation<R>(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      id: string;
      data?: T;
    }>
  ): Promise<void> {
    const batch = writeBatch(db);

    operations.forEach(({ type, id, data }) => {
      const docRef = this.getDocRef(id);

      switch (type) {
        case 'create':
          if (!data) throw new Error('Data is required for create operation');
          batch.set(docRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          break;
        case 'update':
          if (!data) throw new Error('Data is required for update operation');
          batch.update(docRef, {
            ...data,
            updatedAt: new Date()
          });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });

    await batch.commit();
  }
}
