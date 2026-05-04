import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import {
  PaginationInput,
  PaginatedOutput,
  toPagination,
} from '../../../../domain/shared/pagination';

export interface FlowOutput {
  id: number;
  name: string;
}

export class ListFlowsUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute(input?: Partial<PaginationInput>): Promise<PaginatedOutput<FlowOutput>> {
    const { page, limit } = toPagination(input?.page, input?.limit);

    const [flows, total] = await Promise.all([
      this.flowRepository.findAll(),
      this.flowRepository.count(),
    ]);

    const sliced = flows.slice((page - 1) * limit, page * limit);
    const data = sliced.map((f) => ({ id: f.getId(), name: f.getName() }));

    return { data, total, page, limit };
  }
}
