import { RedisService } from '@libs/redis/redis.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  constructor(private readonly redisService: RedisService) {}

  async blacklistToken(tokenJti: string): Promise<void> {
    const expirationTimeInSeconds = 60 * 60 * 24; // 24시간
    await this.redisService.set(tokenJti, 'blacklisted', expirationTimeInSeconds);
  }

  async isTokenBlacklisted(tokenJti: string): Promise<boolean> {
    const result = await this.redisService.get(tokenJti);
    return result === 'blacklisted';
  }
}
