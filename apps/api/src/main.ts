import process from 'node:process';

import cookieParser from 'cookie-parser';
import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';

import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { setupSwagger } from '@common/swagger/swagger.config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    logger: ['error', 'warn'], // 로그 수준 설정
    // logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Expanded logging levels
  });
  const logger = new Logger('Bootstrap');

  app.set('trust proxy', true);
  const whitelist = process.env.WHITELIST_DOMAIN?.split(',');

  app.enableCors({
    origin: whitelist,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Origin, X-Requested-With',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/',
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatted = errors.map(e => ({
          field: e.property,
          error: Object.values(e.constraints ?? {})[0],
        }));

        return new BadRequestException({
          message: '유효성 검사에 실패했습니다.',
          data: formatted,
          errorCode: 'VALIDATION.FAILED',
        });
      },
    }),
  );

  app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    const isStaticFile =
      originalUrl.includes('/static/') ||
      /\.(js|css|map|ico|png|jpg|jpeg|gif|svg)$/.test(originalUrl);

    if (!isStaticFile) {
      res.on('finish', () => {
        const { statusCode } = res;
        const contentLength = res.getHeader('content-length');

        logger.log(
          `${method} ${originalUrl} ${statusCode} ${String(contentLength)} - ${userAgent}`,
        );
      });
    }

    next();
  });

  setupSwagger(app);

  await app.listen(process.env.PORT || 4000);
  console.log(`API listening on http://localhost:${process.env.PORT || 4000}`);
}
bootstrap().catch(console.error);
