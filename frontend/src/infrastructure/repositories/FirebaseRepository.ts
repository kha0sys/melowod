import { IFirebaseRepository } from '@/domain/repositories/IFirebaseRepository';
import { SignInRequest, SignUpRequest, User } from '@/domain/entities/User';
import { QueryConfig } from '@/domain/entities/QueryConfig';
import { DocumentData } from 'firebase/firestore';
import { AuthService } from '@/infrastructure/firebase/auth/auth.service';
import { FirestoreService } from '@/infrastructure/firebase/firestore/firestore.service';
import { StorageService } from '@/infrastructure/firebase/storage/storage.service';

export class FirebaseRepository implements IFirebaseRepository {
  constructor(
    private readonly authService: AuthService,
    private readonly firestoreService: FirestoreService,
    private readonly storageService: StorageService
  ) {}

  // Auth Methods
  async signUp(request: SignUpRequest): Promise<void> {
    return this.authService.signUpWithEmail(
      request.email,
      request.password,
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.category,
      request.city,
      request.country,
      request.gender
    );
  }

  async signIn(request: SignInRequest): Promise<void> {
    return this.authService.signInWithEmail(request.email, request.password);
  }

  async signOut(): Promise<void> {
    return this.authService.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authService.getCurrentUser();
  }

  // Firestore Methods
  async create<T extends DocumentData>(collection: string, data: T, id?: string): Promise<string> {
    return this.firestoreService.create(collection, data, id);
  }

  async update<T extends DocumentData>(collection: string, id: string, data: Partial<T>): Promise<void> {
    return this.firestoreService.update(collection, id, data);
  }

  async delete(collection: string, id: string): Promise<void> {
    return this.firestoreService.delete(collection, id);
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    return this.firestoreService.getById(collection, id);
  }

  async query<T>(collection: string, queries: QueryConfig[]): Promise<T[]> {
    return this.firestoreService.query(collection, queries);
  }

  // Storage Methods
  async uploadFile(path: string, file: File): Promise<string> {
    return this.storageService.uploadFile(path, file);
  }

  async deleteFile(path: string): Promise<void> {
    return this.storageService.deleteFile(path);
  }

  async getFileUrl(path: string): Promise<string> {
    return this.storageService.getDownloadUrl(path);
  }
}
