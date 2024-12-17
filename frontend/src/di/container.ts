import { FirebaseRepository } from '@/infrastructure/repositories/FirebaseRepository';
import { AuthUseCase } from '@/application/useCases/auth/AuthUseCase';
import { FirestoreUseCase } from '@/application/useCases/firestore/FirestoreUseCase';
import { StorageUseCase } from '@/application/useCases/storage/StorageUseCase';
import { authService } from '@/infrastructure/firebase/auth/auth.service';
import { firestoreService } from '@/infrastructure/firebase/firestore/firestore.service';
import { storageService } from '@/infrastructure/firebase/storage/storage.service';

// Repository instance
const firebaseRepository = new FirebaseRepository(
  authService,
  firestoreService,
  storageService
);

// Use Case instances
export const authUseCase = new AuthUseCase(firebaseRepository);
export const firestoreUseCase = new FirestoreUseCase(firebaseRepository);
export const storageUseCase = new StorageUseCase(firebaseRepository);
