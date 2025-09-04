import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardPostDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPopup?: boolean = false;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  popupStartAt?: string;

  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  popupEndAt?: string;
}
