import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { User, UserRole } from '@/domain/entities/User';
import { logger } from '@/infrastructure/services/logger.service';
import { errorService } from '@/infrastructure/services/error.service';
import { getFirebaseAuth, getFirebaseDb } from '@/config/firebase';

const auth = getFirebaseAuth();
const db = getFirebaseDb();

class AuthService {
  private static instance: AuthService;

  private constructor() {
    if (!auth || !db) {
      throw new Error('Firebase services are not initialized');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUpWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    category: string,
    city: string,
    country: string,
    gender: string
  ): Promise<User> {
    try {
      logger.debug('Starting email sign up');
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      logger.debug('User created successfully');
      
      const { user: firebaseUser } = userCredential;

      // Set display name as full name
      await updateProfile(firebaseUser, { displayName: `${firstName} ${lastName}` });
      
      try {
        await sendEmailVerification(firebaseUser);
        logger.debug('Verification email sent');
        alert('Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.');
      } catch (error) {
        logger.error('Error sending verification email:', error);
        alert('Error al enviar correo de verificación. Por favor, inténtalo de nuevo.');
        throw new Error('Failed to send verification email');
      }

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          firstName,
          lastName,
          email,
          phoneNumber,
          category,
          city,
          country,
          gender,
          emailVerified: firebaseUser.emailVerified,
          role: UserRole.USER,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          points: 0,
          achievements: [],
          isEmailVerified: firebaseUser.emailVerified
        });
      } catch (error) {
        logger.error('Error creating user document in Firestore:', error);
        throw new Error('Failed to create user document');
      }

      const user: User = {
        id: firebaseUser.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        category: category,
        city: city,
        country: country,
        gender: gender,
        emailVerified: firebaseUser.emailVerified,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        points: 0,
        achievements: [],
        isEmailVerified: firebaseUser.emailVerified
      };

      return user;
    } catch (error) {
      logger.error('Error signing up:', error);
      throw errorService.handleAuthError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      logger.debug('Starting email sign in');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      logger.debug('User signed in successfully');
      
      const { user: firebaseUser } = userCredential;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        category: userData.category || '',
        city: userData.city || '',
        country: userData.country || '',
        gender: userData.gender || '',
        emailVerified: firebaseUser.emailVerified,
        role: userData.role || UserRole.USER,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
        points: userData.points || 0,
        achievements: userData.achievements || [],
        isEmailVerified: firebaseUser.emailVerified
      };
    } catch (error) {
      logger.error('Error signing in:', error);
      throw errorService.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      logger.debug('Starting sign out');
      await signOut(auth);
      logger.debug('User signed out successfully');
    } catch (error) {
      logger.error('Error signing out:', error);
      throw errorService.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      logger.debug('Getting current user data');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: currentUser.uid,
        email: currentUser.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        category: userData.category || '',
        city: userData.city || '',
        country: userData.country || '',
        gender: userData.gender || '',
        emailVerified: currentUser.emailVerified,
        role: userData.role || UserRole.USER,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
        points: userData.points || 0,
        achievements: userData.achievements || [],
        isEmailVerified: currentUser.emailVerified
      };
    } catch (error) {
      logger.error('Error getting current user:', error);
      throw errorService.handleAuthError(error);
    }
  }
}

export { AuthService };
export const authService = AuthService.getInstance();
