import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

import { FileLoggerService } from './logging.service';

@Global()
@Module({
  providers: [
    FileLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [FileLoggerService],
})
export class LoggingModule {}
