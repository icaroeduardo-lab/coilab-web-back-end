import 'reflect-metadata';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ClassValidatorStrategy } from '../validators/class-validator-strategy';

export interface DesignProps {
  title: string;
  description: string;
  urlImage: string;
}

export class Design {
  @IsString()
  @IsNotEmpty()
  private readonly title: string;

  @IsString()
  @IsNotEmpty()
  private readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  private readonly urlImage: string;

  constructor(props: DesignProps) {
    this.title = props.title;
    this.description = props.description;
    this.urlImage = props.urlImage;
    this.validate();
  }

  private validate() {
    const validator = new ClassValidatorStrategy<Design>();
    validator.validate(this);
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getUrlImage(): string {
    return this.urlImage;
  }
}
