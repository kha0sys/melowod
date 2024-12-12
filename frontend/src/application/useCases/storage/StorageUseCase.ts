import { IFirebaseRepository } from '@/domain/repositories/IFirebaseRepository';

export class StorageUseCase {
  constructor(private readonly firebaseRepository: IFirebaseRepository) {}

  async uploadFile(path: string, file: File): Promise<string> {
    return this.firebaseRepository.uploadFile(path, file);
  }

  async deleteFile(path: string): Promise<void> {
    return this.firebaseRepository.deleteFile(path);
  }

  async getFileUrl(path: string): Promise<string> {
    return this.firebaseRepository.getFileUrl(path);
  }
}
