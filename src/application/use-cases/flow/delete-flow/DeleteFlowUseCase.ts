import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { FlowId } from '../../../../domain/shared/entity-ids';

export interface DeleteFlowInput {
  id: string;
}

export class DeleteFlowUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute(input: DeleteFlowInput): Promise<void> {
    const [flow] = await this.flowRepository.findByIds([FlowId(Number(input.id))]);
    if (!flow) {
      throw new Error(`Flow not found: ${input.id}`);
    }

    await this.flowRepository.delete(FlowId(Number(input.id)));
  }
}
