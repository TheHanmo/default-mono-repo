import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateBoardPostDto } from './dto/create-board-post.dto';
import { ListBoardPostDto } from './dto/list-board-post.dto';
import { UpdateBoardPostDto } from './dto/update-board-post.dto';

import { BoardService } from './board.service';

@ApiTags('board')
@Controller({ path: 'board', version: 'v1' })
export class BoardController {
  constructor(private readonly service: BoardService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: '게시글 생성' })
  create(@Body() dto: CreateBoardPostDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: '게시글 목록' })
  findAll(@Query() query: ListBoardPostDto) {
    return this.service.findAll(query);
  }

  @Get('popups/active')
  @ApiOkResponse({ description: '현재 활성 팝업 목록' })
  findActivePopups(@Query() query: Omit<ListBoardPostDto, 'popupActiveOnly'>) {
    return this.service.findAll({ ...query, popupActiveOnly: true });
  }

  @Get(':id')
  @ApiOkResponse({ description: '게시글 상세' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOkResponse({ description: '게시글 수정' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoardPostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOkResponse({ description: '게시글 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
