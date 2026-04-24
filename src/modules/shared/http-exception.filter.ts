import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

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

      this.logger.error(`${request.method} ${request.url} — ${message}`, exception.stack);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: 500, message: 'Internal server error' });
      return;
    }

    this.logger.error(`${request.method} ${request.url} — unknown exception`, String(exception));
    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: 500, message: 'Internal server error' });
  }
}
