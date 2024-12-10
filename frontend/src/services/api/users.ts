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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  },

  async getUserStats(userId: string): Promise<UserStats | null> {
    const statsDoc = await getDoc(doc(db, 'userStats', userId));
    return statsDoc.exists() ? statsDoc.data() as UserStats : null;
  },

  async getGlobalRanking(limit: number = 100): Promise<User[]> {
    const q = query(
      collection(db, 'userStats'),
      orderBy('points', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    for (const doc of querySnapshot.docs) {
      const userDoc = await getDoc(doc.ref);
      if (userDoc.exists()) {
        users.push(userDoc.data() as User);
      }
    }

    return users;
  },

  async getBoxRanking(boxName: string, limit: number = 100): Promise<User[]> {
    const q = query(
      collection(db, 'userStats'),
      where('box', '==', boxName),
      orderBy('points', 'desc'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    for (const doc of querySnapshot.docs) {
      const userDoc = await getDoc(doc.ref);
      if (userDoc.exists()) {
        users.push(userDoc.data() as User);
      }
    }

    return users;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await setDoc(doc(db, 'users', userId), 
      {
        ...userData,
        updatedAt: new Date().toISOString(),
      }, 
      { merge: true }
    );
  },
};
