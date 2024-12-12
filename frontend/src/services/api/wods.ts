import { 
  collection,
  doc,
  addDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Wod, WodResult } from '@/types/wod';

export type DifficultyLevel = 'rx' | 'scaled' | 'beginner';

export const wodService = {
  async createDailyWod(wodData: Wod, mediaFiles?: File[]): Promise<void> {
    const mediaUrls: string[] = [];

    // Subir archivos multimedia a Storage
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const storageRef = ref(storage, `wods/${new Date().toISOString()}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
      }
    }

    // Crear el WOD en Firestore
    await addDoc(collection(db, 'wods'), {
      ...wodData,
      mediaUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getWodByDate(date?: string): Promise<Wod | null> {
    const searchDate = date ? new Date(date) : new Date();
    searchDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const q = query(
      collection(db, 'wods'),
      where('date', '>=', searchDate),
      where('date', '<', nextDay),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as Wod;
  },

  async submitWodResult(result: WodResult, mediaFiles?: File[]): Promise<void> {
    const mediaUrls: string[] = [];

    // Subir archivos multimedia a Storage
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const storageRef = ref(storage, `results/${result.userId}/${new Date().toISOString()}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
      }
    }

    // Guardar el resultado en Firestore
    await addDoc(collection(db, 'wodResults'), {
      ...result,
      mediaUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getLeaderboard(wodId: string, level: DifficultyLevel = 'rx'): Promise<WodResult[]> {
    const q = query(
      collection(db, 'wodResults'),
      where('wodId', '==', wodId),
      where('level', '==', level),
      orderBy('score', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WodResult[];
  },

  calculatePoints(result: WodResult): number {
    // Implementar lógica de cálculo de puntos según el tipo de WOD y resultado
    // Este es un ejemplo simple
    let points = 10; // Puntos base por completar

    switch (result.level.toLowerCase()) {
      case 'rx':
        points *= 1.5;
        break;
      case 'scaled':
        points *= 1.2;
        break;
      case 'beginner':
        points *= 1.0;
        break;
    }

    return Math.round(points);
  },
};
