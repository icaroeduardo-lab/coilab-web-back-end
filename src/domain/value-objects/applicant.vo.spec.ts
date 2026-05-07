import { Applicant } from './applicant.vo';
import { ApplicantId } from '../shared/entity-ids';

describe('Applicant Value Object', () => {
  const validId = ApplicantId(1);

  it('should create a valid applicant', () => {
    const applicant = new Applicant({ id: validId, name: 'pomar' });

    expect(applicant.getId()).toBe(validId);
    expect(applicant.getName()).toBe('pomar');
  });

  it('should throw error if name is too short', () => {
    expect(() => new Applicant({ id: validId, name: 'Jo' })).toThrow(
      'Validation failed: name must be longer than or equal to 3 characters',
    );
  });
});
