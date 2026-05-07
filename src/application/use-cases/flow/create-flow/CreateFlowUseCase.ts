import { Flow } from '../../../../domain/value-objects/flow.vo';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { FlowId } from '../../../../domain/shared/entity-ids';

export interface CreateFlowInput {
  name: string;
}

export interface CreateFlowOutput {
  id: number;
  name: string;
}

export class CreateFlowUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute(input: CreateFlowInput): Promise<CreateFlowOutput> {
    const flow = new Flow({ id: FlowId(0), name: input.name });
    const saved = await this.flowRepository.save(flow);
    return { id: saved.getId(), name: saved.getName() };
  }
}
