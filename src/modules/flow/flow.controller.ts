import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
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
import { CreateFlowUseCase } from '../../application/use-cases/flow/create-flow/CreateFlowUseCase';
import { ListFlowsUseCase } from '../../application/use-cases/flow/list-flows/ListFlowsUseCase';
import { DeleteFlowUseCase } from '../../application/use-cases/flow/delete-flow/DeleteFlowUseCase';
import { CreateFlowDto } from './dto/create-flow.dto';

@ApiTags('Flows')
@ApiBearerAuth()
@Controller('flows')
export class FlowController {
  constructor(
    @Inject(CreateFlowUseCase) private readonly createFlow: CreateFlowUseCase,
    @Inject(ListFlowsUseCase) private readonly listFlows: ListFlowsUseCase,
    @Inject(DeleteFlowUseCase) private readonly deleteFlow: DeleteFlowUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar fluxo de trabalho' })
  @ApiResponse({ status: 201, description: 'Fluxo criado com sucesso.' })
  @ApiResponse({ status: 422, description: 'Dados inválidos.' })
  create(@Body() dto: CreateFlowDto) {
    return this.createFlow.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar fluxos (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Página de fluxos.' })
  list(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listFlows.execute({ page: Number(page), limit: Number(limit) });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover fluxo' })
  @ApiParam({ name: 'id', description: 'UUID do fluxo' })
  @ApiResponse({ status: 204, description: 'Fluxo removido.' })
  @ApiResponse({ status: 404, description: 'Fluxo não encontrado.' })
  async remove(@Param('id') id: string) {
    await this.deleteFlow.execute({ id });
  }
}
