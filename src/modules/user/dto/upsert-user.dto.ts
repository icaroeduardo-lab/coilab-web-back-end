import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertUserDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Cognito user sub (UUID)',
  })
  @IsUUID()
  @IsNotEmpty()
  cognitoSub: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/joao.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
