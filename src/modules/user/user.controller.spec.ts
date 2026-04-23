import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UpsertUserFromCognitoUseCase } from '../../application/use-cases/user/upsert-user-from-cognito/UpsertUserFromCognitoUseCase';
import { GetUserUseCase } from '../../application/use-cases/user/get-user/GetUserUseCase';
import { randomUUID } from 'crypto';

const mockUpsert = { execute: jest.fn() };
const mockGetUser = { execute: jest.fn() };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UpsertUserFromCognitoUseCase, useValue: mockUpsert },
        { provide: GetUserUseCase, useValue: mockGetUser },
      ],
    }).compile();
    controller = module.get(UserController);
  });

  describe('sync', () => {
    it('calls upsertUser.execute with dto', async () => {
      mockUpsert.execute.mockResolvedValue(undefined);
      const dto = { id: randomUUID(), name: 'John', imageUrl: 'https://img.example.com' };
      await controller.sync(dto);
      expect(mockUpsert.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('get', () => {
    it('calls getUser.execute with id and returns result', async () => {
      const id = randomUUID();
      const output = { id, name: 'John' };
      mockGetUser.execute.mockResolvedValue(output);
      const result = await controller.get(id);
      expect(mockGetUser.execute).toHaveBeenCalledWith({ id });
      expect(result).toBe(output);
    });
  });
});
