import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao.silva@email.com' })
  email: string;

  @ApiPropertyOptional({ example: 'https://lh3.googleusercontent.com/a/avatar.jpg' })
  imageUrl?: string;
}
