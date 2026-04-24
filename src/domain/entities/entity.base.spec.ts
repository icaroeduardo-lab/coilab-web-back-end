import 'reflect-metadata';
import { IsNotEmpty, IsString } from 'class-validator';
import { Entity } from './entity.base';

class ConcreteEntity extends Entity {
  @IsString()
  @IsNotEmpty()
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
    this.validate();
  }

  getValue(): string {
    return this.value;
  }

  update(value: string): void {
    this.value = value;
    this.validate();
  }
}

describe('Entity base', () => {
  it('creates valid entity without throwing', () => {
    expect(() => new ConcreteEntity('valid')).not.toThrow();
  });

  it('throws on invalid construction', () => {
    expect(() => new ConcreteEntity('')).toThrow('Validation failed');
  });

  it('throws on invalid update', () => {
    const entity = new ConcreteEntity('valid');
    expect(() => entity.update('')).toThrow('Validation failed');
  });
});
