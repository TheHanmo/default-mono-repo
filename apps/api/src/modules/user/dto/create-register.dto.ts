import { IsEmail, IsEnum, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { MemberType } from '@common/enum/member-type.enum';

export class CreateRegisterDto {
  @ApiProperty({ description: '이메일 주소 (로그인 ID)', example: 'test@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: '비밀번호', example: 'securePassword123' })
  @IsString()
  password!: string;

  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString()
  name!: string;

  @ApiProperty({ description: '휴대폰 번호', example: '010-1234-5678' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ description: '회원 종류', enum: MemberType })
  @IsEnum(MemberType)
  memberType!: MemberType;
}
