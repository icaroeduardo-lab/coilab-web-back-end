import { Design } from './design.vo';

describe('Design Value Object', () => {
  it('should create a valid design', () => {
    const props = {
      title: 'Homepage Desktop',
      description: 'Main landing page design',
      urlImage: 'https://example.com/image.png',
    };
    const design = new Design(props);

    expect(design.getTitle()).toBe(props.title);
    expect(design.getDescription()).toBe(props.description);
    expect(design.getUrlImage()).toBe(props.urlImage);
  });

  it('should throw error if title is empty', () => {
    const props = {
      title: '',
      description: 'Desc',
      urlImage: 'https://example.com/image.png',
    };
    expect(() => new Design(props)).toThrow('Validation failed: title should not be empty');
  });

  it('should throw error if urlImage is not a valid URL', () => {
    const props = {
      title: 'Title',
      description: 'Desc',
      urlImage: 'invalid-url',
    };
    expect(() => new Design(props)).toThrow('Validation failed: urlImage must be a URL address');
  });
});