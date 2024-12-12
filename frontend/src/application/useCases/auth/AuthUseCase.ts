import { IFirebaseRepository } from '@/domain/repositories/IFirebaseRepository';
import { SignInRequest, SignUpRequest, User } from '@/domain/entities/User';

export class AuthUseCase {
  constructor(private readonly firebaseRepository: IFirebaseRepository) {}

  async signUp(request: SignUpRequest): Promise<void> {
    return this.firebaseRepository.signUp(request);
  }

  async signIn(request: SignInRequest): Promise<void> {
    return this.firebaseRepository.signIn(request);
  }

  async signOut(): Promise<void> {
    return this.firebaseRepository.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.firebaseRepository.getCurrentUser();
  }
}
