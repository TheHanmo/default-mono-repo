import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthenticationService } from '@modules/auth/authentication.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    accessToken?: string;
    refreshToken?: string;
  }> {
    const { email, password, keepLogin, ip, userAgent } = loginDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException({
        message: '보안상의 이유로 5회 이상 오류 시, 본인인증이 필요해요.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException({
        message: '보안상의 이유로 5회 이상 오류 시, 본인인증이 필요해요.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const accessToken = await this.authenticationService.createAccessToken(user);
    const refreshToken = await this.authenticationService.createRefreshToken(user, keepLogin);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userService.updateRefreshToken(user.id, hashedRefreshToken, ip, userAgent);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(username: string, password: string): Promise<Partial<UserEntity> | null> {
    const user = await this.userService.findByEmail(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 유효하지 않습니다.',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const sessions = await this.userService.findByRefreshToken(user.id);

    if (!sessions?.length) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 존재하지 않습니다.',
        errorCode: 'MISSING_REFRESH_TOKEN',
      });
    }

    const isMatched = (
      await Promise.all(sessions.map(s => bcrypt.compare(refreshToken, s.refreshToken)))
    ).some(Boolean);

    if (!isMatched) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 유효하지 않습니다.',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    return this.authenticationService.createAccessToken(user);
  }
}
