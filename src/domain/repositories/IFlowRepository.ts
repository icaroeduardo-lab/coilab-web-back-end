import { Flow } from '../value-objects/flow.vo';
import { FlowId } from '../shared/entity-ids';

export interface IFlowRepository {
  findByIds(ids: FlowId[]): Promise<Flow[]>;
  findAll(): Promise<Flow[]>;
  count(): Promise<number>;
  save(flow: Flow): Promise<void>;
  delete(id: FlowId): Promise<void>;
}
