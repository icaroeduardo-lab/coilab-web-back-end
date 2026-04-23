import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateFlowDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
