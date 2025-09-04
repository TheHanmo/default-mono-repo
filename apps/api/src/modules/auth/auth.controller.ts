import { ApiResponseDto } from '@app-types/api-response.type';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { responseSuccess } from '@utils/response.util';

import { AuthService } from '@modules/auth/auth.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { RegisterResponseDto } from '@modules/auth/dto/register-response.dto';
import { JwtUser } from '@modules/auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { CreateRegisterDto } from '@modules/user/dto/create-register.dto';
import { UserService } from '@modules/user/user.service';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: 'v1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description:
      '이메일과 비밀번호를 사용하여 회원가입 합니다. <br/><br/>Function: authRegister <br/> Dto: CreateRegisterDto <br/> Response: RegisterResponseDto',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  async register(@Body() dto: CreateRegisterDto): Promise<ApiResponseDto<RegisterResponseDto>> {
    const result = await this.authService.register(dto);

    return responseSuccess(result, '회원가입이 완료되었습니다.');
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description:
      '이메일과 비밀번호를 사용하여 로그인 합니다. <br/><br/>Function: authLogin <br/> Dto: LoginDto <br/> Response: LoginResponseDto',
  })
  @ApiBody({
    type: LoginDto,
    description: '로그인에 필요한 정보',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  async login(
    @Request() req: ExpressRequest & { user: JwtUser },
    @Response() res: ExpressResponse,
  ) {
    const loginDto = req.body as LoginDto;

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] || // 프록시 환경
      req.socket?.remoteAddress || // 기본 환경
      '';

    const userAgent = req.headers['user-agent'] as string;

    const { accessToken, refreshToken } = await this.authService.login({
      ...loginDto,
      ip,
      userAgent,
    });

    try {
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 15, // 15분
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: loginDto.keepLogin ? 1000 * 60 * 60 * 24 * 365 : 1000 * 60 * 60 * 24 * 7,
      });

      res.status(200).json({
        success: true,
        message: '로그인 성공',
      });
    } catch {
      throw new UnauthorizedException({
        message: '프로필 조회 중 오류가 발생했습니다.',
        errorCode: 'PROFILE_FETCH_ERROR',
      });
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 로그인된 사용자를 로그아웃 합니다. <br/><br/>Function: authLogout',
  })
  async logout(
    @Response() res: ExpressResponse,
    @Request() req: ExpressRequest & { user: JwtUser },
  ): Promise<void> {
    const refreshToken = (req.cookies as { [key: string]: string })['refresh_token'];
    const userId = req.user.userId;

    if (refreshToken) {
      await this.userService.deleteRefreshToken(userId, refreshToken);
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(200).json({
      message: '로그아웃 성공',
    });
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: '토큰 갱신',
    description:
      '리프레시 토큰을 사용하여 액세스 토큰을 갱신합니다. <br/><br/>Function: authRefreshToken',
  })
  async refreshToken(
    @Response() res: ExpressResponse,
    @Request() req: ExpressRequest & { user: JwtUser },
  ): Promise<void> {
    const refreshToken = (req.cookies as { [key: string]: string })['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 없습니다. 다시 로그인 해주세요.',
        errorCode: 'NO_REFRESH_TOKEN',
      });
    }

    try {
      const accessToken = await this.authService.refreshToken(refreshToken);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // 크로스 도메인을 위해 'none'으로 변경
        maxAge: 1000 * 60 * 15,
      });

      res.status(200).json({
        success: true,
        message: '요청이 성공적으로 처리되었습니다.',
        data: {
          accessToken,
        },
      });
    } catch {
      throw new UnauthorizedException({
        message: '유효하지 않은 리프레시 토큰입니다. 다시 로그인 해주세요.',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }
  }
}
