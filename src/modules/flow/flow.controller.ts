import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Listar todos os fluxos' })
  @ApiResponse({ status: 200, description: 'Lista de fluxos.' })
  list() {
    return this.listFlows.execute();
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
