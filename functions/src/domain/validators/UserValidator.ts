import { User } from '../entities/User';
import { Validator } from '../shared/validation/Validator';

export class UserValidator extends Validator<Partial<User>> {
  protected doValidate(user: Partial<User>): void {
    if (user.email !== undefined) {
      this.validateEmail(user.email);
    }

    if (user.displayName !== undefined) {
      this.validateDisplayName(user.displayName);
    }

    if (user.profile !== undefined) {
      this.validateProfile(user.profile);
    }
  }

  private validateEmail(email: string): void {
    if (!email) {
      this.addError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.addError('Invalid email format');
    }
  }

  private validateDisplayName(displayName: string): void {
    if (!displayName) {
      this.addError('Display name is required');
      return;
    }

    if (displayName.length < 2) {
      this.addError('Display name must be at least 2 characters long');
    }

    if (displayName.length > 50) {
      this.addError('Display name must not exceed 50 characters');
    }
  }

  private validateProfile(profile: any): void {
    if (!profile.experience) {
      this.addError('Experience level is required in profile');
    }

    const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'elite'];
    if (!validExperienceLevels.includes(profile.experience)) {
      this.addError('Invalid experience level');
    }
  }
}
