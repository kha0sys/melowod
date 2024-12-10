import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Wod, WodResult } from '@/types/wod';

export type DifficultyLevel = 'RX' | 'SCALED' | 'BEGINNER';

export const wodService = {
  async createDailyWod(wodData: Wod, mediaFiles?: File[]): Promise<void> {
    const wodId = doc(collection(db, 'wods')).id;
    const mediaUrls: string[] = [];

    // Si hay archivos multimedia, subirlos a Storage
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const storageRef = ref(storage, `wods/${wodId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
      }
    }

    await setDoc(doc(db, 'wods', wodId), {
      ...wodData,
      id: wodId,
      mediaUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async getWodByDate(date?: string): Promise<Wod | null> {
    const searchDate = date ? new Date(date) : new Date();
    searchDate.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'wods'),
      where('date', '>=', searchDate),
      where('date', '<', new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)),
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
    const resultId = doc(collection(db, 'wodResults')).id;
    const mediaUrls: string[] = [];

    // Si hay archivos multimedia (fotos o videos del resultado), subirlos a Storage
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const storageRef = ref(storage, `wodResults/${resultId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
      }
    }

    await setDoc(doc(db, 'wodResults', resultId), {
      ...result,
      id: resultId,
      mediaUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Actualizar las estadísticas del usuario
    const userStatsRef = doc(db, 'userStats', result.userId);
    const userStatsDoc = await getDoc(userStatsRef);
    const currentStats = userStatsDoc.exists() ? userStatsDoc.data() : {
      totalWods: 0,
      completedWods: 0,
      points: 0,
    };

    await setDoc(userStatsRef, {
      ...currentStats,
      totalWods: currentStats.totalWods + 1,
      completedWods: currentStats.completedWods + 1,
      points: currentStats.points + this.calculatePoints(result),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async getLeaderboard(wodId: string, level: DifficultyLevel = 'RX'): Promise<WodResult[]> {
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

    switch (result.level) {
      case 'RX':
        points *= 1.5;
        break;
      case 'SCALED':
        points *= 1.2;
        break;
      case 'BEGINNER':
        points *= 1.0;
        break;
    }

    return Math.round(points);
  },
};
