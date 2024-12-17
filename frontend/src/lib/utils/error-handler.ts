import { FirebaseError } from 'firebase/app';
import { AuthError } from '@/domain/entities/User';

export class ErrorHandler {
  static handle(error: unknown): Error {
    if (error instanceof FirebaseError) {
      return this.handleFirebaseError(error);
    }
    
    if (error instanceof Error) {
      return error;
    }

    return new Error('An unknown error occurred');
  }

  static handleAuthError(error: unknown): AuthError {
    if (error instanceof FirebaseError) {
      const baseError = this.handleFirebaseError(error);
      return {
        code: error.code,
        message: baseError.message
      };
    }
    
    if (error instanceof Error) {
      return {
        code: 'auth/unknown',
        message: error.message
      };
    }

    return {
      code: 'auth/unknown',
      message: 'An unknown error occurred'
    };
  }

  private static handleFirebaseError(error: FirebaseError): Error {
    switch (error.code) {
      // Auth Errors
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return new Error('Credenciales inválidas');
      case 'auth/email-already-in-use':
        return new Error('El email ya está registrado');
      case 'auth/weak-password':
        return new Error('La contraseña es demasiado débil');
      case 'auth/invalid-email':
        return new Error('El email no es válido');
      case 'auth/operation-not-allowed':
        return new Error('Operación no permitida');
      case 'auth/requires-recent-login':
        return new Error('Por favor, vuelve a iniciar sesión para continuar');
      case 'auth/too-many-requests':
        return new Error('Demasiados intentos. Por favor, intenta más tarde');
      case 'auth/network-request-failed':
        return new Error('Error de conexión. Verifica tu conexión a internet');
      case 'auth/internal-error':
        return new Error('Error interno. Por favor, intenta más tarde');
      case 'auth/invalid-credential':
        return new Error('Credenciales inválidas');
      case 'auth/account-exists-with-different-credential':
        return new Error('Ya existe una cuenta con este email');
      case 'auth/popup-blocked':
        return new Error('El popup fue bloqueado. Por favor, permite popups para continuar');
      case 'auth/popup-closed-by-user':
        return new Error('El proceso de autenticación fue cancelado');
      case 'auth/unauthorized-domain':
        return new Error('Este dominio no está autorizado');
      case 'auth/invalid-action-code':
        return new Error('El código de acción no es válido');
      case 'auth/expired-action-code':
        return new Error('El código de acción ha expirado');
      
      // Firestore Errors
      case 'permission-denied':
        return new Error('No tienes permisos para realizar esta acción');
      case 'not-found':
        return new Error('El recurso solicitado no existe');
      case 'already-exists':
        return new Error('El recurso ya existe');
      case 'failed-precondition':
        return new Error('Operación no permitida en el estado actual');
      case 'aborted':
        return new Error('La operación fue abortada');
      case 'out-of-range':
        return new Error('Valor fuera de rango');
      case 'unimplemented':
        return new Error('Operación no implementada');
      case 'resource-exhausted':
        return new Error('Límite de recursos alcanzado');
      case 'cancelled':
        return new Error('Operación cancelada');
      case 'data-loss':
        return new Error('Pérdida de datos irrecuperable');
      case 'unknown':
        return new Error('Error desconocido');
      case 'invalid-argument':
        return new Error('Argumento inválido');
      case 'deadline-exceeded':
        return new Error('Tiempo de espera excedido');
      case 'unauthenticated':
        return new Error('No autenticado');
        
      default:
        return new Error(error.message);
    }
  }
}
