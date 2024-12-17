import { ValidationResult } from './ValidationResult';

export abstract class Validator<T> {
  protected errors: string[] = [];

  public validate(value: T): ValidationResult {
    this.errors = [];
    this.doValidate(value);
    return this.errors.length === 0
      ? ValidationResult.success()
      : ValidationResult.failure(this.errors);
  }

  protected abstract doValidate(value: T): void;

  protected addError(error: string): void {
    this.errors.push(error);
  }
}
