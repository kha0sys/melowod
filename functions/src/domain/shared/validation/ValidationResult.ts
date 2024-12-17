export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationResult {
  private constructor(
    public isValid: boolean,
    public errors: string[] = []
  ) {}

  public static success(): ValidationResult {
    return new ValidationResult(true);
  }

  public static failure(errors: string[]): ValidationResult {
    return new ValidationResult(false, errors);
  }

  public throwIfInvalid(): void {
    if (!this.isValid) {
      throw new ValidationError(this.errors.join(', '));
    }
  }
}
