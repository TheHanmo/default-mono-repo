import { ApiProperty } from '@nestjs/swagger';

import { CompanyType } from '@common/enum/company-type.enum';

export class CompaniesResponseDto {
  @ApiProperty({
    example: 1,
    description: '회사 고유 ID',
  })
  id!: number;

  @ApiProperty({
    example: 'Acme Corp',
    description: '회사/조직 이름',
  })
  name!: string;

  @ApiProperty({
    enum: CompanyType,
    example: CompanyType.HQ,
    description: '회사 타입(본사/총판/대행사)',
  })
  type!: CompanyType;

  @ApiProperty({
    example: '회사 메모',
    description: '회사 메모',
    nullable: true,
  })
  memo?: string | null;
}
