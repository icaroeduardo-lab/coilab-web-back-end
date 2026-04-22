import { Flow } from '../value-objects/flow.vo';
import { FlowId } from '../shared/entity-ids';

export interface IFlowRepository {
  findByIds(ids: FlowId[]): Promise<Flow[]>;
  save(flow: Flow): Promise<void>;
}
