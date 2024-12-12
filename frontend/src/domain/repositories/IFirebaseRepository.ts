import { SignInRequest, SignUpRequest, UpdateProfileRequest, User } from '../entities/User';

export interface IFirebaseRepository {
  // Auth Repository
  signUp(request: SignUpRequest): Promise<void>;
  signIn(request: SignInRequest): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  
  // Firestore Repository
  create<T>(collection: string, data: T, id?: string): Promise<string>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  getById<T>(collection: string, id: string): Promise<T | null>;
  query<T>(collection: string, queries: QueryConfig[]): Promise<T[]>;
  
  // Storage Repository
  uploadFile(path: string, file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
}

export interface QueryConfig {
  field: string;
  operator: QueryOperator;
  value: any;
}

export type QueryOperator = 
  | '==' 
  | '<' 
  | '<=' 
  | '>' 
  | '>=' 
  | '!=' 
  | 'array-contains' 
  | 'in' 
  | 'array-contains-any' 
  | 'not-in';
