import { NextFunction, Request, Response } from 'express';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let accessToken = (req.cookies as { [key: string]: string })['access_token'];

    if (!accessToken && req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(' ');
      if (type === 'Bearer' && token) {
        accessToken = token;
      }
    }

    if (accessToken) {
      try {
        req.user = this.jwtService.verify(accessToken);
      } catch {
        req.user = undefined;
      }
    }
    next();
  }
}
