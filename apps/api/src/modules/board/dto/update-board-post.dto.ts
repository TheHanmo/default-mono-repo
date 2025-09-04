import { PartialType } from '@nestjs/swagger';

import { CreateBoardPostDto } from './create-board-post.dto';

export class UpdateBoardPostDto extends PartialType(CreateBoardPostDto) {}
