import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import awsLambdaFastify from '@fastify/aws-lambda';
import type { Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './modules/shared/http-exception.filter';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(helmet as any, { contentSecurityPolicy: false });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Coilab API')
    .setDescription('API de gestão de projetos de produto digital — Discovery, Design e Diagramação.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  return app;
}

let cachedHandler: Handler;

export const handler: Handler = async (event, context, callback) => {
  if (!cachedHandler) {
    const app = await bootstrap();
    await app.init();
    logger.log('Lambda cold start — app initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cachedHandler = awsLambdaFastify(app.getHttpAdapter().getInstance() as any);
  }
  return cachedHandler(event, context, callback);
};

if (require.main === module) {
  bootstrap().then((app) => {
    app.listen(3000, '0.0.0.0').then(() => logger.log('Server running on http://localhost:3000'));
  });
}
