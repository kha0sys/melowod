import { User, UserPreferences, UserProfile } from '../../domain/entities/User';
import { UserActivity } from '../../domain/entities/UserActivity';
import { Achievement } from '../../domain/entities/Achievement';
import * as admin from 'firebase-admin';
import { ApplicationError } from '../shared/errors/ApplicationError';

export class UserService {
  private static instance: UserService;
  private db: FirebaseFirestore.Firestore;

  private constructor() {
    this.db = admin.firestore();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // User Management
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userRef = this.db.collection('users').doc();
      const now = admin.firestore.Timestamp.now();
      
      await userRef.set({
        ...user,
        createdAt: now,
        updatedAt: now
      });

      // Crear documento de estadísticas inicial
      await this.db.collection('userStats').doc(userRef.id).set({
        totalWods: 0,
        completedWods: 0,
        averageScore: 0,
        level: user.profile?.experience || 'beginner',
        updatedAt: now
      });

      return userRef.id;
    } catch (error) {
      throw new ApplicationError('USER_CREATION_FAILED', 'Failed to create user', error);
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      throw new ApplicationError('USER_FETCH_FAILED', 'Failed to fetch user', error);
    }
  }

  async updateUser(userId: string, user: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...user,
        updatedAt: admin.firestore.Timestamp.now()
      };
      
      await this.db.collection('users').doc(userId).update(updateData);
    } catch (error) {
      throw new ApplicationError('USER_UPDATE_FAILED', 'Failed to update user', error);
    }
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).update({
        preferences: admin.firestore.FieldValue.arrayUnion(preferences),
        updatedAt: admin.firestore.Timestamp.now()
      });
    } catch (error) {
      throw new ApplicationError('PREFERENCES_UPDATE_FAILED', 'Failed to update preferences', error);
    }
  }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).update({
        'profile': profile,
        updatedAt: admin.firestore.Timestamp.now()
      });

      // Actualizar nivel en estadísticas si cambió
      if (profile.experience) {
        await this.db.collection('userStats').doc(userId).update({
          level: profile.experience,
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
    } catch (error) {
      throw new ApplicationError('PROFILE_UPDATE_FAILED', 'Failed to update profile', error);
    }
  }

  async getUserAnalytics(userId: string): Promise<{
    stats: FirebaseFirestore.DocumentData | null;
    recentActivity: UserActivity[];
    achievements: Achievement[];
  }> {
    try {
      // Obtener estadísticas del usuario
      const statsDoc = await this.db.collection('userStats').doc(userId).get();
      const stats = statsDoc.exists ? statsDoc.data() || null : null;

      // Obtener actividad reciente (últimos 5 WODs completados)
      const recentActivitySnapshot = await this.db.collection('userActivity')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      // Obtener logros del usuario
      const achievementsSnapshot = await this.db.collection('userAchievements')
        .where('userId', '==', userId)
        .get();

      return {
        stats,
        recentActivity: recentActivitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserActivity[],
        achievements: achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Achievement[]
      };
    } catch (error) {
      throw new ApplicationError('ANALYTICS_FETCH_FAILED', 'Failed to fetch analytics', error);
    }
  }

  async getBoxMembers(boxName: string): Promise<User[]> {
    try {
      const usersSnapshot = await this.db.collection('users')
        .where('box', '==', boxName)
        .get();

      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
    } catch (error) {
      throw new ApplicationError('BOX_MEMBERS_FETCH_FAILED', 'Failed to fetch box members', error);
    }
  }

  async getBoxAnalytics(boxName: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    completionRate: number;
    levelDistribution: Record<string, number>;
  }> {
    try {
      const members = await this.getBoxMembers(boxName);
      const now = admin.firestore.Timestamp.now();
      const thirtyDaysAgo = new admin.firestore.Timestamp(
        now.seconds - (30 * 24 * 60 * 60),
        now.nanoseconds
      );

      // Obtener WODs completados en los últimos 30 días
      const recentWodsSnapshot = await this.db.collection('wodResults')
        .where('userId', 'in', members.map(m => m.id))
        .where('completedAt', '>=', thirtyDaysAgo)
        .get();

      const activeUserIds = new Set(recentWodsSnapshot.docs.map(doc => doc.data().userId));

      const levelDistribution = members.reduce((acc, member) => {
        const level = member.profile?.experience || 'beginner';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalMembers: members.length,
        activeMembers: activeUserIds.size,
        completionRate: members.length > 0 ? activeUserIds.size / members.length : 0,
        levelDistribution
      };
    } catch (error) {
      throw new ApplicationError('BOX_ANALYTICS_FETCH_FAILED', 'Failed to fetch box analytics', error);
    }
  }
}

export const userService = UserService.getInstance();
