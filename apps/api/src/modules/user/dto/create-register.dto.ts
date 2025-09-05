import { IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { MemberType } from '@common/enum/member-type.enum';

export class CreateRegisterDto {
  @ApiProperty({ description: '이메일 주소 (로그인 ID)', example: 'test@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: '비밀번호', example: 'securePassword123' })
  @IsString()
  password!: string;

  @ApiProperty({ description: '회사 ID', example: 1, required: false })
  @IsString()
  companyId?: number;

  @ApiProperty({ description: '메모', example: '메모', required: false })
  @IsString()
  memo?: string;

  memberType!: MemberType;
}
