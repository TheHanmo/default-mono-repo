import { v4 as uuidv4 } from 'uuid';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';

import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccessToken(user: UserEntity): Promise<string> {
    const expiresIn = this.configService.get('NODE_ENV') === 'production' ? '15m' : '7d';

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      jti: uuidv4(),
    };
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async createRefreshToken(user: UserEntity, keepLogin: boolean): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      jti: uuidv4(),
      type: 'refresh',
    };

    const expiresIn = keepLogin ? '365d' : '7d';

    return await this.jwtService.signAsync(payload, { expiresIn });
  }
}
