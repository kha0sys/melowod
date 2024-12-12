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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User, UserStats } from '@/types/user';

export const userService = {
  async createUser(userData: User): Promise<void> {
    if (!userData.id) {
      throw new Error('User ID is required');
    }

    await setDoc(doc(db, 'users', userData.id), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Inicializar estadísticas del usuario
    await setDoc(doc(db, 'userStats', userData.id), {
      totalWods: 0,
      completedWods: 0,
      points: 0,
      rxCount: 0,
      scaledCount: 0,
      beginnerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  },

  async getUserStats(userId: string): Promise<UserStats | null> {
    const statsDoc = await getDoc(doc(db, 'userStats', userId));
    return statsDoc.exists() ? { id: statsDoc.id, ...statsDoc.data() } as UserStats : null;
  },

  async getGlobalRanking(limit: number = 100): Promise<UserStats[]> {
    const q = query(
      collection(db, 'userStats'),
      orderBy('points', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserStats[];
  },

  async getBoxRanking(boxId: string, limit: number = 100): Promise<UserStats[]> {
    const q = query(
      collection(db, 'userStats'),
      where('boxId', '==', boxId),
      orderBy('points', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserStats[];
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...userData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};
