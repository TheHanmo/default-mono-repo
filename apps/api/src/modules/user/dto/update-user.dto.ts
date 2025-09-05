import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '비밀번호', example: 'securePassword123' })
  @IsString()
  password!: string;

  @ApiProperty({ description: '메모', example: '메모', required: false })
  @IsString()
  memo?: string;
}
