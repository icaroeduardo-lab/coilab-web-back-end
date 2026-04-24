import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddDesignDto {
  @ApiProperty({ example: 'Tela de Login' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Proposta de redesign da tela de login com suporte a SSO.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://cdn.example.com/designs/login-v2.png' })
  @IsUrl()
  @IsNotEmpty()
  urlImage: string;
}
