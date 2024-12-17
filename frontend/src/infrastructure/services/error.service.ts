import { logger } from './logger.service';

export class ErrorService {
  private static instance: ErrorService;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          message = 'Email not found';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        default:
          message = error.message || message;
      }
    }

    logger.error('Authentication error:', { code: error.code, message });
    return new Error(message);
  }

  public handleDatabaseError(error: any): Error {
    let message = 'A database error occurred';
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          message = 'You do not have permission to perform this action';
          break;
        case 'not-found':
          message = 'The requested resource was not found';
          break;
        default:
          message = error.message || message;
      }
    }

    logger.error('Database error:', { code: error.code, message });
    return new Error(message);
  }

  public handleStorageError(error: any): Error {
    let message = 'A storage error occurred';
    
    if (error.code) {
      switch (error.code) {
        case 'storage/object-not-found':
          message = 'File does not exist';
          break;
        case 'storage/unauthorized':
          message = 'User does not have permission to access the object';
          break;
        case 'storage/canceled':
          message = 'User canceled the upload';
          break;
        default:
          message = error.message || message;
      }
    }

    logger.error('Storage error:', { code: error.code, message });
    return new Error(message);
  }
}

export const errorService = ErrorService.getInstance();
