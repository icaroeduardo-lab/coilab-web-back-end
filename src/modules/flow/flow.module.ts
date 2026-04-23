import { Module } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../shared/injection-tokens';
import { PrismaFlowRepository } from '../../infra/db/prisma/repositories/PrismaFlowRepository';
import { CreateFlowUseCase } from '../../application/use-cases/flow/create-flow/CreateFlowUseCase';
import { ListFlowsUseCase } from '../../application/use-cases/flow/list-flows/ListFlowsUseCase';
import { DeleteFlowUseCase } from '../../application/use-cases/flow/delete-flow/DeleteFlowUseCase';
import { IFlowRepository } from '../../domain/repositories/IFlowRepository';
import { FlowController } from './flow.controller';

@Module({
  controllers: [FlowController],
  providers: [
    { provide: REPOSITORY_TOKENS.FLOW, useClass: PrismaFlowRepository },
    {
      provide: CreateFlowUseCase,
      useFactory: (repo: IFlowRepository) => new CreateFlowUseCase(repo),
      inject: [REPOSITORY_TOKENS.FLOW],
    },
    {
      provide: ListFlowsUseCase,
      useFactory: (repo: IFlowRepository) => new ListFlowsUseCase(repo),
      inject: [REPOSITORY_TOKENS.FLOW],
    },
    {
      provide: DeleteFlowUseCase,
      useFactory: (repo: IFlowRepository) => new DeleteFlowUseCase(repo),
      inject: [REPOSITORY_TOKENS.FLOW],
    },
  ],
})
export class FlowModule {}
