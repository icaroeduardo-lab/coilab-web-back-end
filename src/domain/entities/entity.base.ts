import { ClassValidatorSingleton } from '../validators/class-validator-singleton';

export abstract class Entity {
  protected validate(): void {
    ClassValidatorSingleton.getInstance<this>().validate(this);
  }
}
