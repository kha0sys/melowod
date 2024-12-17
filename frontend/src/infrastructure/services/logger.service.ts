export class LoggerService {
  private static instance: LoggerService;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public log(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(message, data || '');
    }
  }

  public error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(message, error || '');
    }
  }

  public warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(message, data || '');
    }
  }

  public debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(message, data || '');
    }
  }
}

export const logger = LoggerService.getInstance();
