import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      reply.status(exception.getStatus()).send(exception.getResponse());
      return;
    }

    if (exception instanceof Error) {
      const message = exception.message;

      if (message.includes('not found') || message.includes('não encontrada') || message.includes('não encontrado')) {
        reply.status(HttpStatus.NOT_FOUND).send({ statusCode: 404, message });
        return;
      }

      if (message.includes('já adicionado') || message.includes('não pode') || message.includes('obrigatórios')) {
        reply.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ statusCode: 422, message });
        return;
      }
    }

    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
