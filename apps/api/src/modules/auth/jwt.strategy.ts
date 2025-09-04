import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { TokenService } from '@modules/auth/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private tokenService: TokenService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    console.log('JWT_SECRET:', secret); // Debugging line to check if the secret is loaded correctly
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = (request as unknown as { cookies?: Record<string, string> }).cookies
            ?.partner_access_token;
          return typeof token === 'string' ? token : null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const isBlacklisted = await this.tokenService.isTokenBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
