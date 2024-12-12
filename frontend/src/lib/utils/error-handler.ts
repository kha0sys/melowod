import { FirebaseError } from 'firebase/app';

export interface AppError extends Error {
  code: string;
  userMessage: string;
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    if (error instanceof FirebaseError) {
      return this.handleFirebaseError(error);
    }
    
    if (error instanceof Error) {
      return {
        ...error,
        code: 'unknown',
        userMessage: 'Ha ocurrido un error inesperado'
      };
    }

    return {
      name: 'UnknownError',
      message: 'An unknown error occurred',
      code: 'unknown',
      userMessage: 'Ha ocurrido un error inesperado'
    } as AppError;
  }

  private static handleFirebaseError(error: FirebaseError): AppError {
    const baseError = {
      name: error.name,
      message: error.message,
      code: error.code,
    };

    switch (error.code) {
      // Auth Errors
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return {
          ...baseError,
          userMessage: 'Credenciales inválidas'
        };
      case 'auth/email-already-in-use':
        return {
          ...baseError,
          userMessage: 'El email ya está registrado'
        };
      case 'auth/weak-password':
        return {
          ...baseError,
          userMessage: 'La contraseña debe tener al menos 6 caracteres'
        };
      
      // Firestore Errors
      case 'permission-denied':
        return {
          ...baseError,
          userMessage: 'No tienes permisos para realizar esta acción'
        };
      case 'not-found':
        return {
          ...baseError,
          userMessage: 'El recurso solicitado no existe'
        };
      
      // Network Errors
      case 'network-request-failed':
        return {
          ...baseError,
          userMessage: 'Error de conexión. Verifica tu conexión a internet'
        };
      
      // Default
      default:
        return {
          ...baseError,
          userMessage: 'Ha ocurrido un error inesperado'
        };
    }
  }
}
