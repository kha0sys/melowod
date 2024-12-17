import { userRepository } from '../../infrastructure/repositories/UserRepository';
import { userStatsRepository } from '../../infrastructure/repositories/UserStatsRepository';
import { UserManagementService } from './services/UserManagementService';
import { UserPreferencesService } from './services/UserPreferencesService';
import { UserAnalyticsService } from './services/UserAnalyticsService';
import { UserValidator } from '../../domain/validators/UserValidator';

export class UserModule {
  private static instance: UserModule;
  
  private readonly userManagementService: UserManagementService;
  private readonly userPreferencesService: UserPreferencesService;
  private readonly userAnalyticsService: UserAnalyticsService;
  private readonly userValidator: UserValidator;

  private constructor() {
    // Inicializar el validador
    this.userValidator = new UserValidator();

    // Inicializar servicios con sus dependencias
    this.userManagementService = new UserManagementService(userRepository);
    this.userPreferencesService = new UserPreferencesService(userRepository);
    this.userAnalyticsService = new UserAnalyticsService(userStatsRepository);
  }

  public static getInstance(): UserModule {
    if (!UserModule.instance) {
      UserModule.instance = new UserModule();
    }
    return UserModule.instance;
  }

  public getUserManagementService(): UserManagementService {
    return this.userManagementService;
  }

  public getUserPreferencesService(): UserPreferencesService {
    return this.userPreferencesService;
  }

  public getUserAnalyticsService(): UserAnalyticsService {
    return this.userAnalyticsService;
  }

  public getUserValidator(): UserValidator {
    return this.userValidator;
  }
}

// Exportar una instancia singleton del módulo
export const userModule = UserModule.getInstance();
