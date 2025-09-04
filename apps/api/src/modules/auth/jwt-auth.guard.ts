import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      throw new UnauthorizedException({
        message: '인증에 실패했습니다. 올바른 토큰을 사용해 주세요.',
        errorCode: 'AUTHENTICATION_FAILED',
      });
    }
    return user;
  }
}
