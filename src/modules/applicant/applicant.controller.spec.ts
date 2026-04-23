import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantController } from './applicant.controller';
import { CreateApplicantUseCase } from '../../application/use-cases/applicant/create-applicant/CreateApplicantUseCase';
import { GetApplicantUseCase } from '../../application/use-cases/applicant/get-applicant/GetApplicantUseCase';
import { ListApplicantsUseCase } from '../../application/use-cases/applicant/list-applicants/ListApplicantsUseCase';
import { UpdateApplicantUseCase } from '../../application/use-cases/applicant/update-applicant/UpdateApplicantUseCase';
import { DeleteApplicantUseCase } from '../../application/use-cases/applicant/delete-applicant/DeleteApplicantUseCase';
import { randomUUID } from 'crypto';

const mockCreate = { execute: jest.fn() };
const mockGet = { execute: jest.fn() };
const mockList = { execute: jest.fn() };
const mockUpdate = { execute: jest.fn() };
const mockDelete = { execute: jest.fn() };

describe('ApplicantController', () => {
  let controller: ApplicantController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantController],
      providers: [
        { provide: CreateApplicantUseCase, useValue: mockCreate },
        { provide: GetApplicantUseCase, useValue: mockGet },
        { provide: ListApplicantsUseCase, useValue: mockList },
        { provide: UpdateApplicantUseCase, useValue: mockUpdate },
        { provide: DeleteApplicantUseCase, useValue: mockDelete },
      ],
    }).compile();
    controller = module.get(ApplicantController);
  });

  describe('create', () => {
    it('calls createApplicant.execute with dto and returns result', async () => {
      const dto = { name: 'Setor TI' };
      const output = { id: randomUUID(), name: 'Setor TI' };
      mockCreate.execute.mockResolvedValue(output);
      const result = await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(output);
    });
  });

  describe('list', () => {
    it('calls listApplicants.execute and returns result', async () => {
      const output = [{ id: randomUUID(), name: 'Setor TI' }];
      mockList.execute.mockResolvedValue(output);
      const result = await controller.list();
      expect(mockList.execute).toHaveBeenCalled();
      expect(result).toBe(output);
    });
  });

  describe('get', () => {
    it('calls getApplicant.execute with id and returns result', async () => {
      const id = randomUUID();
      const output = { id, name: 'Setor TI' };
      mockGet.execute.mockResolvedValue(output);
      const result = await controller.get(id);
      expect(mockGet.execute).toHaveBeenCalledWith({ id });
      expect(result).toBe(output);
    });
  });

  describe('update', () => {
    it('calls updateApplicant.execute with id and name', async () => {
      mockUpdate.execute.mockResolvedValue(undefined);
      const id = randomUUID();
      await controller.update(id, { name: 'Novo Nome' });
      expect(mockUpdate.execute).toHaveBeenCalledWith({ id, name: 'Novo Nome' });
    });
  });

  describe('remove', () => {
    it('calls deleteApplicant.execute with id', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      const id = randomUUID();
      await controller.remove(id);
      expect(mockDelete.execute).toHaveBeenCalledWith({ id });
    });
  });
});
