import { validateSync } from 'class-validator';
import { ValidatorStrategy } from './validator-strategy';

export class ClassValidatorStrategy<T extends object> implements ValidatorStrategy<T> {
  validate(data: T): void {
    const errors = validateSync(data);
    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }
  }
}
