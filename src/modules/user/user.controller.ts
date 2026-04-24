import { Body, Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { GetUserUseCase } from '../../application/use-cases/user/get-user/GetUserUseCase';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(UpsertUserFromCognitoUseCase) private readonly upsertUser: UpsertUserFromCognitoUseCase,
    @Inject(GetUserUseCase) private readonly getUser: GetUserUseCase,
  ) {}

  @Public()
  @Post('sync')
  @HttpCode(204)
  @ApiOperation({ summary: 'Sincronizar usuário do Cognito (chamado pelo trigger pós-confirmação)', description: 'Endpoint público — sem autenticação.' })
  @ApiResponse({ status: 204, description: 'Usuário sincronizado.' })
  async sync(@Body() dto: UpsertUserDto) {
    await this.upsertUser.execute(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário (igual ao Cognito sub)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  get(@Param('id') id: string) {
    return this.getUser.execute({ id });
  }
}
