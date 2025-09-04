import { createClient, RedisClientType } from 'redis';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient!: RedisClientType;
  private isInitialized = false;

  async onModuleInit(): Promise<void> {
    console.log(`### RedisService.onModuleInit()`);
    console.log(`### REDIS_HOST: ${process.env.REDIS_HOST}`);
    console.log(`### REDIS_PORT: ${process.env.REDIS_PORT}`);

    // 만약 Redis의 주소가, localhost이거나 IP형식이 아니라면 Cluster Mode로 동작시킨다.
    // 이는 AWS 망에 있는 Redis(Valkey)는 Cluster Mode로 동작하기 때문이다.
    const host = process.env.REDIS_HOST;
    const isIpFormat = typeof host === 'string' && /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const isProduction = host !== 'localhost' && !isIpFormat;

    // 모드별로 Redis Client를 생성한다.
    // Client Mode와 Cluster Mode는 서로 연결 방식이 다르기 때문이다.
    if (isProduction) {
      console.log(`### Cluster Mode`);
      this.redisClient = createClient({
        url: `rediss://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });
    } else {
      console.log(`### Client Mode`);
      this.redisClient = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
        },
      });
    } // if
    await this.redisClient.connect();
    this.isInitialized = true;
  }

  public async getClient(): Promise<RedisClientType> {
    // 초기화가 완료될 때까지 대기
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
