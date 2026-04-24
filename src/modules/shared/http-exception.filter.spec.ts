import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

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

  it('maps "já adicionado" error to 422', () => {
    const reply = makeReply();
    filter.catch(new Error('Flow já adicionado: id'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(reply.send).toHaveBeenCalledWith({ statusCode: 422, message: 'Flow já adicionado: id' });
  });

  it('maps "não pode" error to 422', () => {
    const reply = makeReply();
    filter.catch(
      new Error('Subtask com status "Aprovado" não pode ser modificada'),
      makeHost(reply),
    );
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('maps "obrigatórios" error to 422', () => {
    const reply = makeReply();
    filter.catch(new Error('Campos obrigatórios não preenchidos: complexity'), makeHost(reply));
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
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
