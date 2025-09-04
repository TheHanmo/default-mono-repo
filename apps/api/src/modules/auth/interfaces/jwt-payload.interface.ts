import { MemberType } from '@common/enum/member-type.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  jti: string;
  role: MemberType;
  type?: 'access' | 'refresh';
}

export interface JwtUser {
  userId: number;
  email: string;
  role: MemberType;
}
