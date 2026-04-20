export interface ValidatorStrategy<T> {
  validate(data: T): void;
}
