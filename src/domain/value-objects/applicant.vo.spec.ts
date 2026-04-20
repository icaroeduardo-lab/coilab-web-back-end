import { Applicant } from './applicant.vo';

describe('Applicant Value Object', () => {
  it('should create a valid applicant', () => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'pomar',
    };
    const applicant = new Applicant(props);

    expect(applicant.getId()).toBe(props.id);
    expect(applicant.getName()).toBe(props.name);
  });

  it('should throw error if name is too short', () => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Jo',
    };
    expect(() => new Applicant(props)).toThrow(
      'Validation failed: name must be longer than or equal to 3 characters',
    );
  });

  it('should throw error if id is invalid', () => {
    const props = {
      id: 'invalid-uuid',
      name: 'coilab',
    };
    expect(() => new Applicant(props)).toThrow('Validation failed: id must be a UUID');
  });
});
