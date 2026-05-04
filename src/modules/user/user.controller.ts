import { Controller, Get, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';

@ApiExtraModels(UserResponseDto)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @Inject(UpsertUserFromCognitoUseCase) private readonly upsertUser: UpsertUserFromCognitoUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado, criando-o caso não exista' })
  @ApiResponse({ status: 200, schema: { $ref: getSchemaPath(UserResponseDto) } })
  me(@CurrentUser() user: JwtPayload) {
    return this.upsertUser.execute({
      cognitoSub: user.sub,
      name: user.name || user.email || user.sub,
      email: user.email,
      imageUrl: user.picture,
    });
  }
}
