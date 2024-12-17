import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { IWodRepository } from '@/domain/repositories/IWodRepository';
import { Wod } from '@/domain/entities/Wod';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { withRetry } from '@/lib/utils/retry';

export class FirebaseWodRepository implements IWodRepository {
  private readonly collectionName = 'wods';

  async getById(id: string): Promise<Wod | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const wodDoc = await withRetry(() => getDoc(docRef));
      if (!wodDoc.exists()) return null;
      return { id: wodDoc.id, ...wodDoc.data() } as Wod;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async getAll(): Promise<Wod[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const querySnapshot = await withRetry(() => getDocs(collectionRef));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Wod);
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async create(wodData: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wod> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const newDocRef = doc(collectionRef);

      const wod: Wod = {
        ...wodData,
        id: newDocRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await withRetry(() => 
        setDoc(newDocRef, {
          ...wod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      return wod;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async update(id: string, wodData: Partial<Wod>): Promise<Wod> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const currentWod = await this.getById(id);

      if (!currentWod) {
        throw new Error(`Wod with id ${id} not found`);
      }

      const updatedWod = {
        ...currentWod,
        ...wodData,
        updatedAt: new Date(),
      };

      await withRetry(() =>
        updateDoc(docRef, {
          ...wodData,
          updatedAt: serverTimestamp(),
        })
      );

      return updatedWod;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await withRetry(() => deleteDoc(docRef));
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async getByType(type: Wod['type']): Promise<Wod[]> {
    return this.queryWods([where('type', '==', type)]);
  }

  async getByDifficulty(difficulty: Wod['difficulty']): Promise<Wod[]> {
    return this.queryWods([where('difficulty', '==', difficulty)]);
  }

  async search(searchQuery: string): Promise<Wod[]> {
    // Implement full-text search using Firebase Extensions or Algolia
    // For now, we'll do a simple client-side search
    try {
      const allWods = await this.getAll();
      const normalizedQuery = searchQuery.toLowerCase();

      return allWods.filter(wod => 
        wod.title.toLowerCase().includes(normalizedQuery) ||
        wod.description.toLowerCase().includes(normalizedQuery) ||
        wod.movements.some(movement => 
          movement.name.toLowerCase().includes(normalizedQuery)
        )
      );
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  private async queryWods(constraints: QueryConstraint[]): Promise<Wod[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(collectionRef, ...constraints);
      
      const querySnapshot = await withRetry(() => getDocs(q));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Wod);
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }
}
