import { Request as ExpressRequest } from 'express';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@common/decorators/roles.decorator';
import { MemberType } from '@common/enum/member-type.enum';

import { responseSuccess } from '@utils/response.util';

import { JwtUser } from '@modules/auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/roles.guard';

import { CreateBoardPostDto } from './dto/create-board-post.dto';
import { ListBoardPostDto } from './dto/list-board-post.dto';
import { UpdateBoardPostDto } from './dto/update-board-post.dto';

import { BoardService } from './board.service';

@ApiTags('Board')
@Controller({ path: 'board', version: 'v1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @Roles(MemberType.SUPER_ADMIN)
  @ApiOperation({
    summary: '게시글 생성',
    description: `
        - isPinned: 공지사항 여부 (기본값: false)
        - isPopup: 팝업 여부 (기본값: false)
        - 팝업을 사용하려면 popupStartAt, popupEndAt 모두 입력해야 함
      `,
  })
  @ApiCreatedResponse({ description: '게시글 생성' })
  async create(
    @Request() req: ExpressRequest & { user: JwtUser },
    @Body() dto: CreateBoardPostDto,
  ) {
    const userId = req.user.userId;

    const result = await this.boardService.create(userId, dto);

    return responseSuccess(result, '게시글이 성공적으로 생성되었습니다.');
  }

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: `
        - page: 페이지 번호 (기본값: 1)
        - pageSize: 페이지당 항목 수 (기본값: 20)
        - popupActiveOnly: true로 설정 시 현재 활성 팝업만 조회
      `,
  })
  @ApiOkResponse({ description: '게시글 목록' })
  async findAll(@Query() query: ListBoardPostDto) {
    const result = await this.boardService.findAll(query);

    return responseSuccess(result, '게시글 목록을 성공적으로 조회했습니다.');
  }

  @Get('popups/active')
  @Roles(MemberType.SUPER_ADMIN)
  @ApiOperation({ summary: '현재 활성 팝업 목록 조회', description: '현재 활성 팝업 목록 조회' })
  @ApiOkResponse({ description: '현재 활성 팝업 목록' })
  findActivePopups(@Query() query: Omit<ListBoardPostDto, 'popupActiveOnly'>) {
    return this.boardService.findAll({ ...query, popupActiveOnly: true });
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회', description: 'id로 게시글 상세 조회' })
  @ApiOkResponse({ description: '게시글 상세' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.boardService.findOne(id);

    return responseSuccess(result, '게시글을 성공적으로 조회했습니다.');
  }

  @Patch(':id')
  @Roles(MemberType.SUPER_ADMIN)
  @ApiOperation({
    summary: '게시글 수정',
    description: `
        - isPinned: 공지사항 여부
        - isPopup: 팝업 여부
        - 팝업을 사용하려면 popupStartAt, popupEndAt 모두 입력해야 함
      `,
  })
  @ApiOkResponse({ description: '게시글 수정' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoardPostDto) {
    const result = await this.boardService.update(id, dto);

    if (!result) {
      throw new BadRequestException({
        message: '게시글 수정에 실패했습니다.',
        errorCode: 'BOARD_UPDATE_FAILED',
      });
    }

    return responseSuccess(result, '게시글이 성공적으로 수정되었습니다.');
  }

  @Delete(':id')
  @Roles(MemberType.SUPER_ADMIN)
  @ApiOperation({ summary: '게시글 삭제', description: 'id로 게시글 삭제' })
  @ApiOkResponse({ description: '게시글 삭제' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.boardService.remove(id);
    if (!result) {
      throw new BadRequestException({
        message: '게시글 삭제에 실패했습니다.',
        errorCode: 'BOARD_DELETE_FAILED',
      });
    }

    return responseSuccess(result, '게시글이 성공적으로 삭제되었습니다.');
  }
}
