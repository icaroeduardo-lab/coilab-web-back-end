import { HttpException, HttpStatus, ArgumentsHost, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { DomainException } from '../../domain/shared/domain.exception';

const fakeRequest = { method: 'GET', url: '/api/test' };

function makeHost(reply: object): ArgumentsHost {
  return {
    switchToHttp: () => ({ getResponse: () => reply, getRequest: () => fakeRequest }),
  } as unknown as ArgumentsHost;
}

function makeReply() {
  const reply = { status: jest.fn(), send: jest.fn() };
  reply.status.mockReturnValue(reply);
  return reply;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('passes HttpException through with its status and response', () => {
    const reply = makeReply();
    const exception = new HttpException({ message: 'Bad Request' }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(exception.getResponse());
  });

  it('maps "not found" error to 404', () => {
    const reply = makeReply();
    filter.catch(new Error('Task not found: abc'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(reply.send).toHaveBeenCalledWith({ statusCode: 404, message: 'Task not found: abc' });
  });

  it('maps "não encontrada" error to 404', () => {
    const reply = makeReply();
    filter.catch(new Error('SubTask não encontrada: xyz'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('maps "não encontrado" error to 404', () => {
    const reply = makeReply();
    filter.catch(new Error('Flow não encontrado: id'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('maps DomainException to 422 with message', () => {
    const reply = makeReply();
    filter.catch(new DomainException('Regra de negócio violada'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(reply.send).toHaveBeenCalledWith({ statusCode: 422, message: 'Regra de negócio violada' });
  });

  it('returns 500 for unknown Error', () => {
    const reply = makeReply();
    filter.catch(new Error('Something unexpected'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(reply.send).toHaveBeenCalledWith({ statusCode: 500, message: 'Internal server error' });
  });

  it('returns 500 for non-Error exceptions', () => {
    const reply = makeReply();
    filter.catch('string exception', makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
