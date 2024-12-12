import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  Query,
  QuerySnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export class FirestoreService {
  protected getCollection(collectionPath: string): CollectionReference {
    return collection(db, collectionPath);
  }

  protected getDocument(collectionPath: string, documentId: string): DocumentReference {
    return doc(db, collectionPath, documentId);
  }

  async create<T extends DocumentData>(
    collectionPath: string,
    data: T,
    documentId?: string
  ): Promise<string> {
    const docRef = documentId
      ? this.getDocument(collectionPath, documentId)
      : doc(collection(db, collectionPath));

    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async update<T extends DocumentData>(
    collectionPath: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = this.getDocument(collectionPath, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(collectionPath: string, documentId: string): Promise<void> {
    const docRef = this.getDocument(collectionPath, documentId);
    await deleteDoc(docRef);
  }

  async getById<T>(collectionPath: string, documentId: string): Promise<T | null> {
    const docRef = this.getDocument(collectionPath, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  }

  async getAll<T>(collectionPath: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  async queryDocuments<T>(
    collectionPath: string,
    conditions: Array<{
      field: string;
      operator: '==' | '<' | '<=' | '>' | '>=' | '!=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
      value: any;
    }>,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitTo?: number,
    startAfterDoc?: QueryDocumentSnapshot<T>
  ): Promise<T[]> {
    let q: Query = collection(db, collectionPath);

    // Apply conditions
    conditions.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });

    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection || 'asc'));
    }

    // Apply pagination
    if (limitTo) {
      q = query(q, limit(limitTo));
    }

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  async getDocumentsByIds<T>(
    collectionPath: string,
    documentIds: string[]
  ): Promise<T[]> {
    const promises = documentIds.map((id) => this.getById<T>(collectionPath, id));
    const results = await Promise.all(promises);
    return results.filter((result): result is T => result !== null);
  }
}

export const firestoreService = new FirestoreService();
