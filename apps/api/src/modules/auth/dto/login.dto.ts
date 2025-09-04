import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '로그인할 이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email!: string;

  @ApiProperty({ example: 'securePassword123', description: '로그인할 비밀번호' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  password!: string;

  @ApiProperty({ example: true, description: '로그인 상태 유지 여부', default: false })
  @IsBoolean()
  @IsOptional()
  keepLogin!: boolean;

  ip?: string;
  userAgent?: string;
}
