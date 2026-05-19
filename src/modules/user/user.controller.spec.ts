import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users/ListUsersUseCase';
import { JwtPayload } from '../auth/current-user.decorator';
import { randomUUID } from 'crypto';

const mockUpsert = { execute: jest.fn() };
const mockListUsers = { execute: jest.fn() };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UpsertUserFromCognitoUseCase, useValue: mockUpsert },
        { provide: ListUsersUseCase, useValue: mockListUsers },
      ],
    }).compile();
    controller = module.get(UserController);
  });

  describe('me', () => {
    it('upserts user with name, email and picture from ID token claims', async () => {
      const sub = randomUUID();
      const payload: JwtPayload = {
        sub,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        picture: 'https://img.example.com/avatar.jpg',
      };
      const output = {
        id: sub,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        imageUrl: 'https://img.example.com/avatar.jpg',
      };
      mockUpsert.execute.mockResolvedValue(output);

      const result = await controller.me(payload);

      expect(mockUpsert.execute).toHaveBeenCalledWith({
        cognitoSub: sub,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        imageUrl: 'https://img.example.com/avatar.jpg',
      });
      expect(result).toBe(output);
    });

    it('falls back to email when name claim absent', async () => {
      const sub = randomUUID();
      const payload = { sub, email: 'joao.silva@email.com' } as JwtPayload;

      mockUpsert.execute.mockResolvedValue({
        id: sub,
        name: 'joao.silva@email.com',
        email: 'joao.silva@email.com',
      });

      await controller.me(payload);

      expect(mockUpsert.execute).toHaveBeenCalledWith({
        cognitoSub: sub,
        name: 'joao.silva@email.com',
        email: 'joao.silva@email.com',
        imageUrl: undefined,
      });
    });

    it('falls back to sub when name and email both absent', async () => {
      const sub = randomUUID();
      const payload = { sub } as JwtPayload;

      mockUpsert.execute.mockResolvedValue({
        id: sub,
        name: sub,
        email: undefined,
      });

      await controller.me(payload);

      expect(mockUpsert.execute).toHaveBeenCalledWith({
        cognitoSub: sub,
        name: sub,
        email: undefined,
        imageUrl: undefined,
      });
    });
  });
});
