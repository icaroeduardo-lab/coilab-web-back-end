import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';

export interface FlowOutput {
  id: string;
  name: string;
}

export class ListFlowsUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute(): Promise<FlowOutput[]> {
    const flows = await this.flowRepository.findAll();
    return flows.map((f) => ({ id: f.getId(), name: f.getName() }));
  }
}
