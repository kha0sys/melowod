import { FirebaseRepository } from '../repositories/FirebaseRepository';
import { AuthUseCase } from '@/application/useCases/auth/AuthUseCase';
import { FirestoreUseCase } from '@/application/useCases/firestore/FirestoreUseCase';
import { StorageUseCase } from '@/application/useCases/storage/StorageUseCase';

// Repository instances
const firebaseRepository = new FirebaseRepository();

// Use Case instances
export const authUseCase = new AuthUseCase(firebaseRepository);
export const firestoreUseCase = new FirestoreUseCase(firebaseRepository);
export const storageUseCase = new StorageUseCase(firebaseRepository);
