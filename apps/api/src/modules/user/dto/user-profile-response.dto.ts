import { ApiProperty } from '@nestjs/swagger';

import { MemberType } from '@common/enum/member-type.enum';

import { CompaniesResponseDto } from '@modules/company/dto/companies-response.dto';

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

  @ApiProperty({
    type: () => CompaniesResponseDto,
    description: '소속 회사 ID',
    nullable: true,
  })
  company!: CompaniesResponseDto;

  @ApiProperty({ example: '메모', description: '메모', nullable: true })
  memo?: string | null;
}
