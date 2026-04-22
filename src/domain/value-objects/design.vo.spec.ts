import { Design } from './design.vo';
import { DesignId, ApplicantId } from '../shared/entity-ids';

describe('Design Value Object', () => {
  const validProps = {
    id: DesignId('550e8400-e29b-41d4-a716-446655440010'),
    title: 'Homepage Desktop',
    description: 'Main landing page design',
    urlImage: 'https://example.com/image.png',
    user: ApplicantId('550e8400-e29b-41d4-a716-446655440003'),
    dateUpload: new Date('2026-04-21'),
  };

  it('should create a valid design', () => {
    const design = new Design(validProps);

    expect(design.getId()).toBe(validProps.id);
    expect(design.getTitle()).toBe(validProps.title);
    expect(design.getDescription()).toBe(validProps.description);
    expect(design.getUrlImage()).toBe(validProps.urlImage);
    expect(design.getUser()).toBe(validProps.user);
    expect(design.getDateUpload()).toBe(validProps.dateUpload);
  });

  it('should throw error if title is empty', () => {
    expect(() => new Design({ ...validProps, title: '' })).toThrow(
      'Validation failed: title should not be empty',
    );
  });

  it('should throw error if urlImage is not a valid URL', () => {
    expect(() => new Design({ ...validProps, urlImage: 'invalid-url' })).toThrow(
      'Validation failed: urlImage must be a URL address',
    );
  });
});
