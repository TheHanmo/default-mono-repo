import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthenticationService } from '@modules/auth/authentication.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { RegisterResponseDto } from '@modules/auth/dto/register-response.dto';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { CreateRegisterDto } from '@modules/user/dto/create-register.dto';
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

  async register(registerDto: CreateRegisterDto): Promise<RegisterResponseDto> {
    const { email, password } = registerDto;

    const userExists = await this.userService.findByEmail(email);

    if (userExists) {
      throw new ConflictException({
        message: '이미 등록된 이메일입니다.',
        errorCode: 'EMAIL_ALREADY_REGISTERED',
      });
    }

    registerDto.password = await bcrypt.hash(password, 10);
    const result = await this.userService.create(registerDto);

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      memberType: result.memberType,
    };
  }

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
    let userId: number;

    const secret = this.configService.get<string>('JWT_SECRET');

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret,
      });

      userId = payload.sub;
    } catch {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 유효하지 않습니다.',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    const user = await this.userService.findById(userId);

    if (!user?.refreshToken) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 존재하지 않습니다.',
        errorCode: 'MISSING_REFRESH_TOKEN',
      });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValid) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 유효하지 않습니다.',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    return await this.authenticationService.createAccessToken(user);
  }
}
