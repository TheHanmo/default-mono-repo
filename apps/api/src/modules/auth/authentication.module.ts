import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigService as NestConfigService } from '@nestjs/config/dist/config.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthenticationService } from '@modules/auth/authentication.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (nestConfigService: NestConfigService): JwtModuleOptions => ({
        secret: nestConfigService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthenticationService],
  exports: [AuthenticationService, JwtModule],
})
export class AuthenticationModule {}
