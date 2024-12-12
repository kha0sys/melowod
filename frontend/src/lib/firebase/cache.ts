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
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { openDB, IDBPDatabase } from 'idb';
import { ErrorHandler } from '@/lib/utils/error-handler';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
  version: string;
  hash: string;
}

interface CacheOptions {
  expiresIn?: number;
  forceFetch?: boolean;
  enablePersistence?: boolean;
  version?: string;
}

class FirestoreCache {
  private memoryCache: Map<string, CacheEntry<any>>;
  private db: IDBPDatabase | null = null;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly DB_NAME = 'firestore-cache';
  private readonly STORE_NAME = 'cache-entries';
  private readonly APP_VERSION = '1.0.0';
  private subscriptions: Map<string, () => void>;
  private pendingWrites: Map<string, Promise<void>>;

  constructor() {
    this.memoryCache = new Map();
    this.subscriptions = new Map();
    this.pendingWrites = new Map();
    this.initIndexedDB();
  }

  private async initIndexedDB() {
    try {
      this.db = await openDB(this.DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('cache-entries')) {
            const store = db.createObjectStore('cache-entries', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('version', 'version');
          }
        },
      });

      // Cleanup old entries periodically
      this.cleanupExpiredEntries();
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  private async cleanupExpiredEntries() {
    if (!this.db) return;

    const now = Date.now();
    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const index = store.index('timestamp');

    let cursor = await index.openCursor();
    while (cursor) {
      const entry = cursor.value as CacheEntry<any>;
      if (now > entry.timestamp + entry.expiresIn || entry.version !== this.APP_VERSION) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  private generateHash(data: any): string {
    return JSON.stringify(data)
      .split('')
      .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(36);
  }

  private getCacheKey(path: string, queryParams?: QueryConstraint[]): string {
    if (!queryParams?.length) return path;
    return `${path}:${queryParams.map(q => q.toString()).join(',')}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.expiresIn || 
           entry.version !== this.APP_VERSION;
  }

  private async setCacheEntry<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: options.expiresIn || this.DEFAULT_EXPIRY,
      version: options.version || this.APP_VERSION,
      hash: this.generateHash(data)
    };

    // Update memory cache
    this.memoryCache.set(key, entry);

    // Update IndexedDB if persistence is enabled
    if (options.enablePersistence && this.db) {
      const pendingWrite = this.pendingWrites.get(key);
      if (pendingWrite) {
        await pendingWrite;
      }

      const writePromise = this.db.put(this.STORE_NAME, {
        id: key,
        ...entry
      });

      this.pendingWrites.set(key, writePromise);
      await writePromise;
      this.pendingWrites.delete(key);
    }
  }

  private async getCacheEntry<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<CacheEntry<T> | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T>;
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry;
    }

    // Check IndexedDB if persistence is enabled
    if (options.enablePersistence && this.db) {
      const entry = await this.db.get(this.STORE_NAME, key) as CacheEntry<T>;
      if (entry && !this.isExpired(entry)) {
        // Update memory cache
        this.memoryCache.set(key, entry);
        return entry;
      }
    }

    return null;
  }

  async getDocument<T>(
    docRef: DocumentReference<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    const { forceFetch = false, enablePersistence = true } = options;
    const cacheKey = docRef.path;

    try {
      if (!forceFetch) {
        const cached = await this.getCacheEntry<T>(cacheKey, { enablePersistence });
        if (cached) return cached.data;
      }

      const docSnap = await getDoc(docRef);
      const data = docSnap.data() || null;

      if (data) {
        await this.setCacheEntry(cacheKey, data, { ...options, enablePersistence });
      }

      return data;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  async getCollection<T>(
    collectionRef: CollectionReference<T>,
    queryConstraints: QueryConstraint[] = [],
    options: CacheOptions = {}
  ): Promise<T[]> {
    const { forceFetch = false, enablePersistence = true } = options;
    const cacheKey = this.getCacheKey(collectionRef.path, queryConstraints);

    try {
      if (!forceFetch) {
        const cached = await this.getCacheEntry<T[]>(cacheKey, { enablePersistence });
        if (cached) return cached.data;
      }

      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      await this.setCacheEntry(cacheKey, data, { ...options, enablePersistence });

      return data;
    } catch (error) {
      throw ErrorHandler.handle(error);
    }
  }

  subscribeToDocument<T>(
    docRef: DocumentReference<T>,
    onChange: (data: T | null) => void,
    options: CacheOptions = {}
  ): () => void {
    const cacheKey = docRef.path;

    // Unsubscribe from any existing subscription
    this.unsubscribe(cacheKey);

    // Create new subscription
    const unsubscribe = onSnapshot(docRef, 
      async (snapshot: DocumentSnapshot<T>) => {
        const data = snapshot.data() || null;
        
        if (data) {
          await this.setCacheEntry(cacheKey, data, options);
        }
        
        onChange(data);
      },
      error => {
        console.error('Error in document subscription:', error);
        onChange(null);
      }
    );

    this.subscriptions.set(cacheKey, unsubscribe);
    return () => this.unsubscribe(cacheKey);
  }

  subscribeToCollection<T>(
    collectionRef: CollectionReference<T>,
    queryConstraints: QueryConstraint[] = [],
    onChange: (data: T[]) => void,
    options: CacheOptions = {}
  ): () => void {
    const cacheKey = this.getCacheKey(collectionRef.path, queryConstraints);

    // Unsubscribe from any existing subscription
    this.unsubscribe(cacheKey);

    // Create new subscription
    const q = query(collectionRef, ...queryConstraints);
    const unsubscribe = onSnapshot(q,
      async (snapshot: QuerySnapshot<T>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        await this.setCacheEntry(cacheKey, data, options);
        onChange(data);
      },
      error => {
        console.error('Error in collection subscription:', error);
        onChange([]);
      }
    );

    this.subscriptions.set(cacheKey, unsubscribe);
    return () => this.unsubscribe(cacheKey);
  }

  private unsubscribe(key: string) {
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear IndexedDB
    if (this.db) {
      await this.db.clear(this.STORE_NAME);
    }

    // Clear all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }

  async invalidateCache(pattern?: RegExp): Promise<void> {
    if (!pattern) {
      await this.clearCache();
      return;
    }

    // Clear matching entries from memory cache
    for (const [key] of this.memoryCache) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear matching entries from IndexedDB
    if (this.db) {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      let cursor = await store.openCursor();

      while (cursor) {
        if (pattern.test(cursor.key.toString())) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
    }
  }
}

// Create a singleton instance
export const firestoreCache = new FirestoreCache();

// Helper functions
export async function getCachedDoc<T>(
  path: string,
  options?: CacheOptions
): Promise<T | null> {
  const docRef = doc(db, path);
  return firestoreCache.getDocument<T>(docRef, options);
}

export async function getCachedCollection<T>(
  path: string,
  queryConstraints: QueryConstraint[] = [],
  options?: CacheOptions
): Promise<T[]> {
  const collectionRef = collection(db, path);
  return firestoreCache.getCollection<T>(collectionRef, queryConstraints, options);
}

export function subscribeToCachedDoc<T>(
  path: string,
  onChange: (data: T | null) => void,
  options?: CacheOptions
): () => void {
  const docRef = doc(db, path);
  return firestoreCache.subscribeToDocument<T>(docRef, onChange, options);
}

export function subscribeToCachedCollection<T>(
  path: string,
  queryConstraints: QueryConstraint[] = [],
  onChange: (data: T[]) => void,
  options?: CacheOptions
): () => void {
  const collectionRef = collection(db, path);
  return firestoreCache.subscribeToCollection<T>(
    collectionRef,
    queryConstraints,
    onChange,
    options
  );
}
