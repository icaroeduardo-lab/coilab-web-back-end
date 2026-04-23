import { Flow } from '../../../../domain/value-objects/flow.vo';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { FlowId } from '../../../../domain/shared/entity-ids';
import { generateId } from '../../../../shared/generate-id';

export interface CreateFlowInput {
  name: string;
}

export interface CreateFlowOutput {
  id: string;
  name: string;
}

export class CreateFlowUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute(input: CreateFlowInput): Promise<CreateFlowOutput> {
    const flow = new Flow({
      id: FlowId(generateId()),
      name: input.name,
    });

    await this.flowRepository.save(flow);

    return { id: flow.getId(), name: flow.getName() };
  }
}
