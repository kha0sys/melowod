import { db } from './config';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  QueryConstraint,
  DocumentData,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore';

type CacheEntry = {
  data: any;
  timestamp: number;
  expiresIn: number;
};

class FirestoreCache {
  private cache: Map<string, CacheEntry>;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.cache = new Map();
  }

  private getCacheKey(path: string, queryParams?: QueryConstraint[]): string {
    if (!queryParams) return path;
    return `${path}:${queryParams.map(q => q.toString()).join(',')}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + entry.expiresIn;
  }

  private setCacheEntry(key: string, data: any, expiresIn: number = this.DEFAULT_EXPIRY) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  async getDocument<T>(
    docRef: DocumentReference<T>,
    options: { expiresIn?: number; forceFetch?: boolean } = {}
  ): Promise<T | null> {
    const { expiresIn = this.DEFAULT_EXPIRY, forceFetch = false } = options;
    const cacheKey = docRef.path;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (!forceFetch && cached && !this.isExpired(cached)) {
      return cached.data as T;
    }

    // Fetch from Firestore
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      this.setCacheEntry(cacheKey, data, expiresIn);
      return data as T;
    }

    return null;
  }

  async getCollection<T>(
    collectionRef: CollectionReference<T>,
    queryConstraints: QueryConstraint[] = [],
    options: { expiresIn?: number; forceFetch?: boolean } = {}
  ): Promise<T[]> {
    const { expiresIn = this.DEFAULT_EXPIRY, forceFetch = false } = options;
    const cacheKey = this.getCacheKey(collectionRef.path, queryConstraints);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (!forceFetch && cached && !this.isExpired(cached)) {
      return cached.data as T[];
    }

    // Fetch from Firestore
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    this.setCacheEntry(cacheKey, data, expiresIn);
    return data as T[];
  }

  invalidate(path: string): void {
    // Convert keys to array before iterating
    Array.from(this.cache.keys()).forEach(key => {
      if (key.startsWith(path)) {
        this.cache.delete(key);
      }
    });
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

// Create a singleton instance
export const firestoreCache = new FirestoreCache();

// Helper functions
export async function getCachedDoc<T = DocumentData>(
  path: string,
  options?: { expiresIn?: number; forceFetch?: boolean }
): Promise<T | null> {
  const docRef = doc(db, path) as DocumentReference<T>;
  return firestoreCache.getDocument(docRef, options);
}

export async function getCachedCollection<T = DocumentData>(
  path: string,
  queryConstraints: QueryConstraint[] = [],
  options?: { expiresIn?: number; forceFetch?: boolean }
): Promise<T[]> {
  const collectionRef = collection(db, path) as CollectionReference<T>;
  return firestoreCache.getCollection(collectionRef, queryConstraints, options);
}
