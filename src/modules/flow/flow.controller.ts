import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CreateFlowUseCase } from '../../application/use-cases/flow/create-flow/CreateFlowUseCase';
import { ListFlowsUseCase } from '../../application/use-cases/flow/list-flows/ListFlowsUseCase';
import { DeleteFlowUseCase } from '../../application/use-cases/flow/delete-flow/DeleteFlowUseCase';
import { CreateFlowDto } from './dto/create-flow.dto';

@Controller('flows')
export class FlowController {
  constructor(
    @Inject(CreateFlowUseCase) private readonly createFlow: CreateFlowUseCase,
    @Inject(ListFlowsUseCase) private readonly listFlows: ListFlowsUseCase,
    @Inject(DeleteFlowUseCase) private readonly deleteFlow: DeleteFlowUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateFlowDto) {
    return this.createFlow.execute(dto);
  }

  @Get()
  list() {
    return this.listFlows.execute();
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteFlow.execute({ id });
  }
}
