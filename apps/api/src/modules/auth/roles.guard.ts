import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { MemberType } from '@common/enum/member-type.enum';

import { JwtUser } from '@modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberType[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req: {
      user: JwtUser;
    } = ctx.switchToHttp().getRequest();

    const user = req.user;

    const ok = requiredRoles.includes(user.role);

    if (!ok) {
      throw new ForbiddenException({ message: '권한이 없습니다.', errorCode: 'NO_PERMISSION' });
    }
    return true;
  }
}
