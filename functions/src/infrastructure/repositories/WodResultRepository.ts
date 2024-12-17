import { db } from '../firebase/admin';
import { IWodResultRepository, WodResult } from '../../domain/entities/Wod';

export class WodResultRepository implements IWodResultRepository {
  private static instance: WodResultRepository;
  private constructor() {}

  public static getInstance(): WodResultRepository {
    if (!WodResultRepository.instance) {
      WodResultRepository.instance = new WodResultRepository();
    }
    return WodResultRepository.instance;
  }

  async create(result: Omit<WodResult, 'id' | 'createdAt'>): Promise<string> {
    const now = new Date();
    const resultRef = db.collection('wodResults').doc();
    
    await resultRef.set({
      ...result,
      id: resultRef.id,
      createdAt: now
    });

    return resultRef.id;
  }

  async getById(id: string): Promise<WodResult | null> {
    const resultDoc = await db.collection('wodResults').doc(id).get();
    return resultDoc.exists ? (resultDoc.data() as WodResult) : null;
  }

  async getByUser(userId: string): Promise<WodResult[]> {
    const snapshot = await db.collection('wodResults')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as WodResult);
  }

  async getByWod(wodId: string): Promise<WodResult[]> {
    const snapshot = await db.collection('wodResults')
      .where('wodId', '==', wodId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as WodResult);
  }
}

export const wodResultRepository = WodResultRepository.getInstance();
