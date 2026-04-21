import { validateSync } from 'class-validator';

export class ClassValidatorSingleton<T extends object> {
  private static readonly instance = new ClassValidatorSingleton<object>();

  static getInstance<T extends object>(): ClassValidatorSingleton<T> {
    return ClassValidatorSingleton.instance as ClassValidatorSingleton<T>;
  }

  validate(data: T): void {
    const errors = validateSync(data);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
  }
}
