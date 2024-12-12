import { 
  auth,
  db,
  storage
} from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { IFirebaseRepository, QueryConfig } from '@/domain/repositories/IFirebaseRepository';
import { 
  User, 
  SignUpRequest, 
  SignInRequest, 
  UpdateProfileRequest, 
  UserRole 
} from '@/domain/entities/User';

export class FirebaseRepository implements IFirebaseRepository {
  // Auth Methods
  async signUp({ email, password, firstName, lastName }: SignUpRequest): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Create user profile in Firestore
    await this.create<User>('users', {
      id: user.uid,
      email,
      firstName,
      lastName,
      role: UserRole.USER,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, user.uid);

    // Update Firebase Auth Profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    await sendEmailVerification(user);
  }

  async signIn({ email, password }: SignInRequest): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await this.getById<User>('users', firebaseUser.uid);
    return userDoc;
  }

  // Firestore Methods
  async create<T>(collection: string, data: T, id?: string): Promise<string> {
    const collectionRef = collection(db, collection);
    const docRef = id ? doc(collectionRef, id) : doc(collectionRef);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  async delete(collection: string, id: string): Promise<void> {
    const docRef = doc(db, collection, id);
    await deleteDoc(docRef);
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    const docRef = doc(db, collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  }

  async query<T>(collection: string, queries: QueryConfig[]): Promise<T[]> {
    const collectionRef = collection(db, collection);
    let q = query(collectionRef);

    queries.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  // Storage Methods
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  async getFileUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
}
