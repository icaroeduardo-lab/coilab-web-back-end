import { User } from './user.entity';
import { UserId } from '../shared/entity-ids';
import { randomUUID } from 'crypto';

const validId = () => UserId(randomUUID());

describe('User entity', () => {
  it('creates user with required fields', () => {
    const user = new User({ id: validId(), name: 'Alice', email: 'alice@example.com' });
    expect(user.getName()).toBe('Alice');
    expect(user.getEmail()).toBe('alice@example.com');
    expect(user.getImageUrl()).toBeUndefined();
  });

  it('creates user with optional imageUrl', () => {
    const user = new User({
      id: validId(),
      name: 'Bob',
      email: 'bob@example.com',
      imageUrl: 'https://img.example.com/bob.png',
    });
    expect(user.getImageUrl()).toBe('https://img.example.com/bob.png');
  });

  it('getId returns the provided UUID', () => {
    const id = validId();
    const user = new User({ id, name: 'Carol', email: 'carol@example.com' });
    expect(user.getId()).toBe(id);
  });

  it('throws when name is empty', () => {
    expect(() => new User({ id: validId(), name: '', email: 'test@example.com' })).toThrow(
      'Validation failed',
    );
  });

  it('throws when id is empty', () => {
    expect(
      () =>
        new User({
          id: '' as ReturnType<typeof UserId>,
          name: 'Dave',
          email: 'dave@example.com',
        }),
    ).toThrow('Validation failed');
  });

  it('syncProfile updates name and imageUrl', () => {
    const user = new User({ id: validId(), name: 'Old', email: 'old@example.com' });
    user.syncProfile('New', 'new@example.com', 'https://img.example.com/new.png');
    expect(user.getName()).toBe('New');
    expect(user.getEmail()).toBe('new@example.com');
    expect(user.getImageUrl()).toBe('https://img.example.com/new.png');
  });

  it('syncProfile clears imageUrl when not provided', () => {
    const user = new User({
      id: validId(),
      name: 'Eve',
      email: 'eve@example.com',
      imageUrl: 'https://img.example.com/e.png',
    });
    user.syncProfile('Eve Updated', 'eve.updated@example.com');
    expect(user.getImageUrl()).toBeUndefined();
    expect(user.getEmail()).toBe('eve.updated@example.com');
  });

  it('syncProfile throws on empty name', () => {
    const user = new User({ id: validId(), name: 'Frank', email: 'frank@example.com' });
    expect(() => user.syncProfile('', 'frank@example.com')).toThrow('Validation failed');
  });
});
