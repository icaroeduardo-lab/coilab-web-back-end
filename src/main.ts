import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import awsLambdaFastify from '@fastify/aws-lambda';
import type { Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './modules/shared/http-exception.filter';

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  return app;
}

let cachedHandler: Handler;

export const handler: Handler = async (event, context, callback) => {
  if (!cachedHandler) {
    const app = await bootstrap();
    await app.init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cachedHandler = awsLambdaFastify(app.getHttpAdapter().getInstance() as any);
  }
  return cachedHandler(event, context, callback);
};

if (require.main === module) {
  bootstrap().then((app) => app.listen(3000, '0.0.0.0'));
}
