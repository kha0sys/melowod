import { db } from '../firebase/admin';
import { IUserRepository, User, UserFilters, UserPreferences, UserProfile } from '../../domain/entities/User';
import { CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';

export class UserRepository implements IUserRepository {
  private static instance: UserRepository;
  private readonly usersRef: CollectionReference;

  private constructor() {
    this.usersRef = db.collection('users');
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const userRef = this.usersRef.doc();
    
    await userRef.set({
      ...user,
      id: userRef.id,
      createdAt: now,
      updatedAt: now
    });

    return userRef.id;
  }

  async getById(id: string): Promise<User | null> {
    const userDoc = await this.usersRef.doc(id).get();
    return userDoc.exists ? (userDoc.data() as User) : null;
  }

  async update(id: string, user: Partial<User>): Promise<void> {
    const now = new Date();
    await this.usersRef.doc(id).update({
      ...user,
      updatedAt: now
    });
  }

  async delete(id: string): Promise<void> {
    await this.usersRef.doc(id).delete();
  }

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await this.usersRef
      .where('email', '==', email)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }

  async list(filters?: UserFilters): Promise<User[]> {
    let query: Query<DocumentData> = this.usersRef;

    if (filters) {
      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }
      if (filters.box) {
        query = query.where('profile.box', '==', filters.box);
      }
      if (filters.experience) {
        query = query.where('profile.experience', '==', filters.experience);
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
    return snapshot.docs.map(doc => doc.data() as User);
  }

  async updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<void> {
    const now = new Date();
    await this.usersRef.doc(id).update({
      'preferences': preferences,
      updatedAt: now
    });
  }

  async updateProfile(id: string, profile: Partial<UserProfile>): Promise<void> {
    const now = new Date();
    await this.usersRef.doc(id).update({
      'profile': profile,
      updatedAt: now
    });
  }
}

export const userRepository = UserRepository.getInstance();
