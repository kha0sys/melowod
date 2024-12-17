import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadMetadata,
} from 'firebase/storage';
import { getFirebaseStorage } from '@/config/firebase';

const storage = getFirebaseStorage();

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(
    path: string,
    file: File,
    metadata?: UploadMetadata
  ): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    return await this.getDownloadUrl(path);
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  async getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }

  async listFiles(path: string): Promise<string[]> {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items.map((item) => item.fullPath);
  }

  async uploadBase64Image(
    path: string,
    base64String: string,
    metadata?: UploadMetadata
  ): Promise<string> {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    
    return await this.uploadFile(path, file, metadata);
  }

  generateStoragePath(folder: string, fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    return `${folder}/${timestamp}-${randomString}.${extension}`;
  }
}

export const storageService = StorageService.getInstance();
