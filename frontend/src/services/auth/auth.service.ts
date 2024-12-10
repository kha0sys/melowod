import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { SignUpRequest, SignInRequest, AuthError, AuthUser } from '@/types/auth';
import { User } from '@/types/user';

export class AuthService {
  async signUp(data: SignUpRequest): Promise<FirebaseUser> {
    const { email, password, firstName, lastName, ...userData } = data;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Guardar datos adicionales del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        firstName,
        lastName,
        email,
        id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Enviar email de verificación
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw this.handleAuthError(error);
    }
  }

  async signIn(data: SignInRequest): Promise<FirebaseUser> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);
      return user;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw this.handleAuthError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordReset(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  async sendEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw this.handleAuthError(error);
    }
  }

  async getUserData(userId: string): Promise<Partial<AuthUser>> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as Partial<AuthUser>;
      }
      return {};
    } catch (error) {
      console.error('Error getting user data:', error);
      return {};
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }

  private handleAuthError(error: any): AuthError {
    if (error?.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return { code: error.code, message: 'Este correo electrónico ya está registrado' };
        case 'auth/invalid-email':
          return { code: error.code, message: 'Correo electrónico inválido' };
        case 'auth/operation-not-allowed':
          return { code: error.code, message: 'Operación no permitida' };
        case 'auth/weak-password':
          return { code: error.code, message: 'La contraseña es demasiado débil' };
        case 'auth/user-disabled':
          return { code: error.code, message: 'Usuario deshabilitado' };
        case 'auth/user-not-found':
          return { code: error.code, message: 'Usuario no encontrado' };
        case 'auth/wrong-password':
          return { code: error.code, message: 'Contraseña incorrecta' };
        default:
          return { code: error.code, message: 'Ocurrió un error durante la autenticación' };
      }
    }
    return { message: error?.message || 'Error desconocido' };
  }
}

export const authService = new AuthService();
