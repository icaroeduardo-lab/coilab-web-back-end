import { User } from './user.entity';
import { UserId } from '../shared/entity-ids';
import { randomUUID } from 'crypto';

const validId = () => UserId(randomUUID());

describe('User entity', () => {
  it('creates user with required fields', () => {
    const user = new User({ id: validId(), name: 'Alice' });
    expect(user.getName()).toBe('Alice');
    expect(user.getImageUrl()).toBeUndefined();
  });

  it('creates user with optional imageUrl', () => {
    const user = new User({
      id: validId(),
      name: 'Bob',
      imageUrl: 'https://img.example.com/bob.png',
    });
    expect(user.getImageUrl()).toBe('https://img.example.com/bob.png');
  });

  it('getId returns the provided UUID', () => {
    const id = validId();
    const user = new User({ id, name: 'Carol' });
    expect(user.getId()).toBe(id);
  });

  it('throws when name is empty', () => {
    expect(() => new User({ id: validId(), name: '' })).toThrow('Validation failed');
  });

  it('throws when id is not a valid UUID', () => {
    expect(() => new User({ id: 'not-a-uuid' as ReturnType<typeof UserId>, name: 'Dave' })).toThrow(
      'Validation failed',
    );
  });

  it('syncProfile updates name and imageUrl', () => {
    const user = new User({ id: validId(), name: 'Old' });
    user.syncProfile('New', 'https://img.example.com/new.png');
    expect(user.getName()).toBe('New');
    expect(user.getImageUrl()).toBe('https://img.example.com/new.png');
  });

  it('syncProfile clears imageUrl when not provided', () => {
    const user = new User({
      id: validId(),
      name: 'Eve',
      imageUrl: 'https://img.example.com/e.png',
    });
    user.syncProfile('Eve Updated');
    expect(user.getImageUrl()).toBeUndefined();
  });

  it('syncProfile throws on empty name', () => {
    const user = new User({ id: validId(), name: 'Frank' });
    expect(() => user.syncProfile('')).toThrow('Validation failed');
  });
});
