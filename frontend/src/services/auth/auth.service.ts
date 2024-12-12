import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  getIdToken,
  User as FirebaseUser,
  UserCredential,
  linkWithPopup,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { 
  SignUpRequest, 
  SignInRequest, 
  AuthError, 
  User, 
  UpdateProfileRequest,
  UserRole 
} from '@/domain/entities/User';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { withRetry } from '@/lib/utils/retry';

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  private rateLimitMap: Map<string, { attempts: number; timestamp: number }> = new Map();

  private checkRateLimit(email: string): void {
    const now = Date.now();
    const rateLimit = this.rateLimitMap.get(email);

    if (rateLimit) {
      if (now - rateLimit.timestamp > RATE_LIMIT_WINDOW) {
        this.rateLimitMap.set(email, { attempts: 1, timestamp: now });
      } else if (rateLimit.attempts >= RATE_LIMIT_ATTEMPTS) {
        throw new Error('Too many attempts. Please try again later.');
      } else {
        this.rateLimitMap.set(email, {
          attempts: rateLimit.attempts + 1,
          timestamp: rateLimit.timestamp,
        });
      }
    } else {
      this.rateLimitMap.set(email, { attempts: 1, timestamp: now });
    }
  }

  async signUp(request: SignUpRequest): Promise<void> {
    try {
      this.checkRateLimit(request.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        request.email,
        request.password
      );

      const { user } = userCredential;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        role: UserRole.USER,
        isEmailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: `${request.firstName} ${request.lastName}`
      });

      await sendEmailVerification(user);
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }

  async signIn(request: SignInRequest): Promise<void> {
    try {
      this.checkRateLimit(request.email);
      await signInWithEmailAndPassword(auth, request.email, request.password);
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        const names = user.displayName?.split(' ') || ['', ''];
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          firstName: names[0],
          lastName: names.slice(1).join(' '),
          role: UserRole.USER,
          isEmailVerified: user.emailVerified,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          resolve(null);
          return;
        }

        const userData = userDoc.data() as User;
        resolve({
          ...userData,
          id: firebaseUser.uid
        });
      });
    });
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });

      if (data.firstName || data.lastName) {
        const currentUser = await this.getCurrentUser();
        await updateProfile(user, {
          displayName: `${data.firstName || currentUser?.firstName} ${
            data.lastName || currentUser?.lastName
          }`
        });
      }
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      this.checkRateLimit(email);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw ErrorHandler.handle(error as AuthError);
    }
  }
}

export const authService = new AuthService();
