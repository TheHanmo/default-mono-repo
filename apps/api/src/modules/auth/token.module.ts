import { RedisModule } from '@libs/redis/redis.module';

import { Global, Module } from '@nestjs/common';

import { TokenService } from '@modules/auth/token.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
