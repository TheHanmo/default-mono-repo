import { createClient, RedisClientType } from 'redis';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient!: RedisClientType;
  private isInitialized = false;

  async onModuleInit(): Promise<void> {
    const host = process.env.REDIS_HOST!;
    const isIpFormat = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const isProduction = host !== 'localhost' && !isIpFormat;

    if (isProduction) {
      this.redisClient = createClient({
        url: `rediss://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });
    } else {
      this.redisClient = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
        },
      });
    }
    await this.redisClient.connect();
    this.isInitialized = true;
  }

  public async getClient(): Promise<RedisClientType> {
    while (!this.isInitialized) {
      console.log(`### RedisService.getClient() - waiting for initialization...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return this.redisClient;
  }

  async set(key: string, value: string, ttl = 300): Promise<void> {
    await this.redisClient.set(key, value, { EX: ttl });
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }
}
