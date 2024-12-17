import { db } from '../firebase/admin';
import { IWodRepository, Wod, WodFilters } from '../../domain/entities/Wod';
import { CollectionReference, Query, DocumentData } from '@google-cloud/firestore';

export class WodRepository implements IWodRepository {
  private static instance: WodRepository;
  private wodsCollection: CollectionReference;

  private constructor() {
    this.wodsCollection = db.collection('wods');
  }

  public static getInstance(): WodRepository {
    if (!WodRepository.instance) {
      WodRepository.instance = new WodRepository();
    }
    return WodRepository.instance;
  }

  async create(wod: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const wodRef = this.wodsCollection.doc();
    
    await wodRef.set({
      ...wod,
      id: wodRef.id,
      createdAt: now,
      updatedAt: now
    });

    return wodRef.id;
  }

  async getById(id: string): Promise<Wod | null> {
    const wodDoc = await this.wodsCollection.doc(id).get();
    return wodDoc.exists ? (wodDoc.data() as Wod) : null;
  }

  async update(id: string, wod: Partial<Wod>): Promise<void> {
    const now = new Date();
    await this.wodsCollection.doc(id).update({
      ...wod,
      updatedAt: now
    });
  }

  async delete(id: string): Promise<void> {
    await this.wodsCollection.doc(id).delete();
  }

  async list(filters?: WodFilters): Promise<Wod[]> {
    let query: Query<DocumentData> = this.wodsCollection;

    if (filters) {
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters.difficulty) {
        query = query.where('difficulty', '==', filters.difficulty);
      }
      if (filters.fromDate) {
        query = query.where('createdAt', '>=', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.where('createdAt', '<=', filters.toDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as Wod);
  }
}

export const wodRepository = WodRepository.getInstance();
