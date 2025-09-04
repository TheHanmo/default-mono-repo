import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggingModule } from '@common/logging/logging.module';
import { FileLoggerService } from '@common/logging/logging.service';
import { JwtMiddleware } from '@common/middleware/jwt.middleware';

import { typeOrmAsyncConfig } from '@config/database.config';

import { AuthModule } from '@modules/auth/auth.module';
import { TokenModule } from '@modules/auth/token.module';
import { BoardModule } from '@modules/board/board.module';
import { UserModule } from '@modules/user/user.module';

import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    LoggingModule,
    TokenModule,
    AuthModule,
    UserModule,
    BoardModule,
  ],
  providers: [
    AppService,
    {
      provide: 'APP_LOGGER',
      useClass: FileLoggerService,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
