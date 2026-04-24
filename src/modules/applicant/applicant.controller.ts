import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateApplicantUseCase } from '../../application/use-cases/applicant/create-applicant/CreateApplicantUseCase';
import { GetApplicantUseCase } from '../../application/use-cases/applicant/get-applicant/GetApplicantUseCase';
import { ListApplicantsUseCase } from '../../application/use-cases/applicant/list-applicants/ListApplicantsUseCase';
import { UpdateApplicantUseCase } from '../../application/use-cases/applicant/update-applicant/UpdateApplicantUseCase';
import { DeleteApplicantUseCase } from '../../application/use-cases/applicant/delete-applicant/DeleteApplicantUseCase';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';

@ApiTags('Applicants')
@ApiBearerAuth()
@Controller('applicants')
export class ApplicantController {
  constructor(
    @Inject(CreateApplicantUseCase) private readonly createApplicant: CreateApplicantUseCase,
    @Inject(GetApplicantUseCase) private readonly getApplicant: GetApplicantUseCase,
    @Inject(ListApplicantsUseCase) private readonly listApplicants: ListApplicantsUseCase,
    @Inject(UpdateApplicantUseCase) private readonly updateApplicant: UpdateApplicantUseCase,
    @Inject(DeleteApplicantUseCase) private readonly deleteApplicant: DeleteApplicantUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar setor/solicitante' })
  @ApiResponse({ status: 201, description: 'Solicitante criado com sucesso.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos.' })
  create(@Body() dto: CreateApplicantDto) {
    return this.createApplicant.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitantes (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Página de solicitantes.' })
  list(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listApplicants.execute({ page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar solicitante por ID' })
  @ApiParam({ name: 'id', description: 'UUID do solicitante' })
  @ApiResponse({ status: 200, description: 'Solicitante encontrado.' })
  @ApiResponse({ status: 404, description: 'Solicitante não encontrado.' })
  get(@Param('id') id: string) {
    return this.getApplicant.execute({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar nome do solicitante' })
  @ApiParam({ name: 'id', description: 'UUID do solicitante' })
  @ApiResponse({ status: 200, description: 'Solicitante atualizado.' })
  update(@Param('id') id: string, @Body() dto: UpdateApplicantDto) {
    return this.updateApplicant.execute({ id, name: dto.name });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover solicitante' })
  @ApiParam({ name: 'id', description: 'UUID do solicitante' })
  @ApiResponse({ status: 204, description: 'Solicitante removido.' })
  @ApiResponse({ status: 404, description: 'Solicitante não encontrado.' })
  async remove(@Param('id') id: string) {
    await this.deleteApplicant.execute({ id });
  }
}
