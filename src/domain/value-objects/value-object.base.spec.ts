import 'reflect-metadata';
import { IsNotEmpty, IsString, Min, IsNumber } from 'class-validator';
import { ValueObject } from './value-object.base';

class ConcreteVO extends ValueObject {
  @IsString()
  @IsNotEmpty()
  private label: string;

  @IsNumber()
  @Min(0)
  private score: number;

  constructor(label: string, score: number) {
    super();
    this.label = label;
    this.score = score;
    this.validate();
  }

  getLabel(): string {
    return this.label;
  }
}

describe('ValueObject base', () => {
  it('creates valid value object without throwing', () => {
    expect(() => new ConcreteVO('test', 10)).not.toThrow();
  });

  it('throws when string field is empty', () => {
    expect(() => new ConcreteVO('', 10)).toThrow('Validation failed');
  });

  it('throws when number violates constraint', () => {
    expect(() => new ConcreteVO('ok', -1)).toThrow('Validation failed');
  });

  it('error message lists all violated constraints', () => {
    expect(() => new ConcreteVO('', -1)).toThrow('Validation failed');
  });
});
