import { Diagram } from './diagram.vo';

describe('Diagram Value Object', () => {
  const validProps = {
    title: 'Database Diagram',
    description: 'Entity relationship diagram',
    urlDiagram: 'https://example.com/diagram.png',
  };

  it('should create a valid diagram', () => {
    const diagram = new Diagram(validProps);

    expect(diagram.getTitle()).toBe(validProps.title);
    expect(diagram.getDescription()).toBe(validProps.description);
    expect(diagram.getUrlDiagram()).toBe(validProps.urlDiagram);
  });

  it('should throw if title is empty', () => {
    expect(() => new Diagram({ ...validProps, title: '' })).toThrow(
      'Validation failed: title should not be empty',
    );
  });

  it('should throw if description is empty', () => {
    expect(() => new Diagram({ ...validProps, description: '' })).toThrow(
      'Validation failed: description should not be empty',
    );
  });

  it('should throw if urlDiagram is not a valid URL', () => {
    expect(() => new Diagram({ ...validProps, urlDiagram: 'invalid-url' })).toThrow(
      'Validation failed: urlDiagram must be a URL address',
    );
  });
});
