import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { env } from './env';

const REQUIRED_CONFIG_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

function validateConfig(config: Record<string, string | undefined>): boolean {
  return REQUIRED_CONFIG_KEYS.every(key => {
    const value = config[key];
    if (!value) {
      console.error(`Missing required Firebase config: ${key}`);
      return false;
    }
    return true;
  });
}

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId
};

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: FirebaseStorage;

  private constructor() {
    if (!validateConfig(firebaseConfig)) {
      throw new Error('Invalid Firebase configuration. Check your environment variables.');
    }

    try {
      this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw new Error('Failed to initialize Firebase services');
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public getApp(): FirebaseApp {
    return this.app;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getDb(): Firestore {
    return this.db;
  }

  public getStorage(): FirebaseStorage {
    return this.storage;
  }
}

// Export singleton instance getters
export const getFirebaseApp = () => FirebaseService.getInstance().getApp();
export const getFirebaseAuth = () => FirebaseService.getInstance().getAuth();
export const getFirebaseDb = () => FirebaseService.getInstance().getDb();
export const getFirebaseStorage = () => FirebaseService.getInstance().getStorage();
