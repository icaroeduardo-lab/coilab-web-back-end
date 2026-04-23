import 'reflect-metadata';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ClassValidatorSingleton } from './class-validator-singleton';

class Inner {
  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Outer {
  @ValidateNested()
  inner: Inner;

  constructor(inner: Inner) {
    this.inner = inner;
  }
}

describe('ClassValidatorSingleton', () => {
  const validator = ClassValidatorSingleton.getInstance();

  it('passes when object is valid', () => {
    expect(() => validator.validate(new Inner('valid'))).not.toThrow();
  });

  it('throws when object has constraint violations', () => {
    expect(() => validator.validate(new Inner(''))).toThrow('Validation failed');
  });

  it('handles nested validation errors without constraints (covers err.constraints || {})', () => {
    // @ValidateNested without @Type() produces a parent ValidationError
    // with no constraints (only children), hitting the || {} branch
    const outer = new Outer(new Inner(''));
    expect(() => validator.validate(outer)).toThrow();
  });
});
