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
import { firestoreCache } from '@/lib/firebase/cache';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { withRetry } from '@/lib/utils/retry';

export class FirebaseWodRepository implements IWodRepository {
  private readonly collectionName = 'wods';
  private readonly cacheOptions = {
    expiresIn: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true,
  };

  async getById(id: string): Promise<Wod | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const cachedWod = await firestoreCache.getDocument<Wod>(docRef, this.cacheOptions);
      
      if (cachedWod) return cachedWod;

      const wodDoc = await withRetry(() => getDoc(docRef));
      if (!wodDoc.exists()) return null;

      const wod = { id: wodDoc.id, ...wodDoc.data() } as Wod;
      await firestoreCache.setCacheEntry(docRef.path, wod, this.cacheOptions);
      
      return wod;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async getAll(): Promise<Wod[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const cachedWods = await firestoreCache.getCollection<Wod>(
        collectionRef,
        [],
        this.cacheOptions
      );

      if (cachedWods) return cachedWods;

      const querySnapshot = await withRetry(() => getDocs(collectionRef));
      const wods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wod[];

      await firestoreCache.setCacheEntry(
        collectionRef.path,
        wods,
        this.cacheOptions
      );

      return wods;
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

      // Invalidate collection cache
      await firestoreCache.invalidateCache(new RegExp(`^${this.collectionName}`));

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

      // Invalidate specific document and collection caches
      await firestoreCache.invalidateCache(new RegExp(`^${this.collectionName}`));

      return updatedWod;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await withRetry(() => deleteDoc(docRef));

      // Invalidate specific document and collection caches
      await firestoreCache.invalidateCache(new RegExp(`^${this.collectionName}`));
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
      
      const cacheKey = `${this.collectionName}:${constraints.map(c => c.toString()).join(',')}`;
      const cachedWods = await firestoreCache.getCacheEntry<Wod[]>(
        cacheKey,
        this.cacheOptions
      );

      if (cachedWods) return cachedWods.data;

      const querySnapshot = await withRetry(() => getDocs(q));
      const wods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wod[];

      await firestoreCache.setCacheEntry(cacheKey, wods, this.cacheOptions);

      return wods;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }
}
