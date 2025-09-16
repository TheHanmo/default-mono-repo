import { ApiProperty } from '@nestjs/swagger';

import { MemberType } from '@common/enum/member-type.enum';

export class UserProfileResponseDto {
  @ApiProperty({ example: 1, description: '회원 고유 ID' })
  id!: number;

  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({
    enum: MemberType,
    example: MemberType.GENERAL,
    description: '회원 종류',
  })
  memberType!: MemberType;

  @ApiProperty({ example: '메모', description: '메모', nullable: true })
  memo?: string | null;
}
