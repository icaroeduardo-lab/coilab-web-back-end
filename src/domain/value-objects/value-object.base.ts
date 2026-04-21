import { ClassValidatorSingleton } from '../validators/class-validator-singleton';

export abstract class ValueObject {
  protected validate(): void {
    ClassValidatorSingleton.getInstance<this>().validate(this);
  }
}
