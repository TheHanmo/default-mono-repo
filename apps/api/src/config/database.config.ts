import { join } from 'path';

import { ConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FileLoggerService } from '@common/logging/logging.service';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (
    nestConfigService: NestConfigService,
    fileLoggerService: FileLoggerService,
  ): TypeOrmModuleOptions => {
    const dbSynchronize: boolean = nestConfigService.get<string>('DB_SYNCHRONIZE') === 'true';

    const dbLogging: boolean = nestConfigService.get<string>('DB_LOGGING') !== 'false';
    let loggingOption = {};

    if (dbLogging) {
      loggingOption = {
        logging: true,
        logger: fileLoggerService,
      };
    }

    return {
      type: 'postgres',
      host: nestConfigService.get<string>('DB_HOST'),
      port: parseInt(nestConfigService.get<string>('DB_PORT') || '5433', 10),
      username: nestConfigService.get<string>('DB_USERNAME'),
      password: nestConfigService.get<string>('DB_PASSWORD'),
      database: nestConfigService.get<string>('DB_NAME'),
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      synchronize: dbSynchronize,
      ...loggingOption,
    };
  },
  inject: [NestConfigService, FileLoggerService],
};
