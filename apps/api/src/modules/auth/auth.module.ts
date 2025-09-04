import { RedisModule } from '@libs/redis/redis.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { AuthenticationModule } from '@modules/auth/authentication.module';
import { JwtStrategy } from '@modules/auth/jwt.strategy';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UserModule, AuthenticationModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
