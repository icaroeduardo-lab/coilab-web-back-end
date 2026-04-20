import { Flow } from './flow.vo';

describe('Flow Value Object', () => {
  it('should create a valid flow', () => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Initial Flow',
    };
    const flow = new Flow(props);

    expect(flow.getId()).toBe(props.id);
    expect(flow.getName()).toBe(props.name);
  });

  it('should throw error if name is too short', () => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Jo',
    };
    expect(() => new Flow(props)).toThrow(
      'Validation failed: name must be longer than or equal to 3 characters',
    );
  });

  it('should throw error if id is invalid', () => {
    const props = {
      id: 'invalid-uuid',
      name: 'Flow Name',
    };
    expect(() => new Flow(props)).toThrow('Validation failed: id must be a UUID');
  });
});