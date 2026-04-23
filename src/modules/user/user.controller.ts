import { Body, Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { GetUserUseCase } from '../../application/use-cases/user/get-user/GetUserUseCase';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UpsertUserFromCognitoUseCase) private readonly upsertUser: UpsertUserFromCognitoUseCase,
    @Inject(GetUserUseCase) private readonly getUser: GetUserUseCase,
  ) {}

  @Public()
  @Post('sync')
  @HttpCode(204)
  async sync(@Body() dto: UpsertUserDto) {
    await this.upsertUser.execute(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUser.execute({ id });
  }
}
