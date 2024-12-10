import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification as sendVerification,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types/user';

export interface SignUpRequest {
  email: string;
  password: string;
  userData: User;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export const authService = {
  async signUp({ email, password, userData }: SignUpRequest): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Guardar datos adicionales del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email,
      id: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Enviar email de verificación
    if (user && !user.emailVerified) {
      await sendVerification(user);
    }

    return user;
  },

  async signIn({ email, password }: SignInRequest): Promise<FirebaseUser> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async sendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      await sendVerification(user);
    } else {
      throw new Error('No user is currently signed in');
    }
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  isAuthenticated(): boolean {
    return !!auth.currentUser;
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  },
};
