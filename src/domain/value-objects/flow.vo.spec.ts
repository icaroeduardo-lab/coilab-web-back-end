import { Flow } from './flow.vo';
import { FlowId } from '../shared/entity-ids';

describe('Flow Value Object', () => {
  const validId = FlowId(1);

  it('should create a valid flow', () => {
    const flow = new Flow({ id: validId, name: 'Initial Flow' });

    expect(flow.getId()).toBe(validId);
    expect(flow.getName()).toBe('Initial Flow');
  });

  it('should throw error if name is too short', () => {
    expect(() => new Flow({ id: validId, name: 'Jo' })).toThrow(
      'Validation failed: name must be longer than or equal to 3 characters',
    );
  });
});
