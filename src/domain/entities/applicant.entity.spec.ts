import { Applicant } from './applicant.entity';
import { ApplicantId } from '../shared/entity-ids';

const validId = () => ApplicantId(1);

describe('Applicant entity', () => {
  it('creates applicant with valid props', () => {
    const applicant = new Applicant({ id: validId(), name: 'Setor TI' });
    expect(applicant.getName()).toBe('Setor TI');
  });

  it('getId returns the provided id', () => {
    const id = validId();
    const applicant = new Applicant({ id, name: 'Setor TI' });
    expect(applicant.getId()).toBe(id);
  });

  it('throws when name is empty', () => {
    expect(() => new Applicant({ id: validId(), name: '' })).toThrow('Validation failed');
  });

  it('changeName updates name', () => {
    const applicant = new Applicant({ id: validId(), name: 'Old Name' });
    applicant.changeName('New Name');
    expect(applicant.getName()).toBe('New Name');
  });

  it('changeName throws on empty string', () => {
    const applicant = new Applicant({ id: validId(), name: 'Valid' });
    expect(() => applicant.changeName('')).toThrow('Validation failed');
  });
});
