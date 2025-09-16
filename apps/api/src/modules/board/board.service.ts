import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { getPagination, getPaginationResult } from '@utils/pagination.util';

import { CreateBoardPostDto } from './dto/create-board-post.dto';
import { ListBoardPostDto } from './dto/list-board-post.dto';
import { UpdateBoardPostDto } from './dto/update-board-post.dto';
import { BoardEntity } from './entity/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: Repository<BoardEntity>,
  ) {}

  private validatePopupWindow(
    isPopup?: boolean,
    start?: string | Date | null,
    end?: string | Date | null,
  ) {
    if (!isPopup) return; // 미사용
    if (!start || !end)
      throw new BadRequestException({
        message: '팝업을 사용하려면 팝업 시작일과 종료일을 모두 입력해야 합니다.',
        errorCode: 'POPUP_START_END_REQUIRED',
      });
    const s = new Date(start);
    const e = new Date(end);
    if (!(s < e)) throw new BadRequestException('팝업 종료일은 시작일보다 커야 합니다.');
  }

  async create(userId: number, dto: CreateBoardPostDto) {
    this.validatePopupWindow(dto.isPopup, dto.popupStartAt, dto.popupEndAt);

    const boardEntity = this.boardRepository.create({
      title: dto.title,
      content: dto.content,
      authorId: userId,
      isPinned: dto.isPinned ?? false,
      isPopup: dto.isPopup ?? false,
      popupStartAt: dto.popupStartAt ? new Date(dto.popupStartAt) : null,
      popupEndAt: dto.popupEndAt ? new Date(dto.popupEndAt) : null,
    });

    return this.boardRepository.save(boardEntity);
  }

  async findAll(dto: ListBoardPostDto) {
    const { page, pageSize, offset } = getPagination(dto);

    const queryBuilder = this.boardRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.isPinned', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip(offset)
      .take(pageSize);

    if (dto.keyword) {
      queryBuilder.andWhere('(p.title ILIKE :kw OR p.content ILIKE :kw)', {
        kw: `%${dto.keyword}%`,
      });
    }

    if (dto.popupActiveOnly) {
      queryBuilder.andWhere(
        'p.isPopup = true AND p.popupStartAt <= :now AND p.popupEndAt >= :now',
        {
          now: new Date(),
        },
      );
    }

    const totalCount = await queryBuilder.getCount();
    const boardEntities = await queryBuilder.getMany();

    return getPaginationResult(boardEntities, totalCount, page, pageSize);
  }

  async findOne(id: number) {
    const found = await this.boardRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!found)
      throw new NotFoundException({
        message: '존재하지 않는 게시글입니다.',
        errorCode: 'BOARD_NOT_FOUND',
      });
    return found;
  }

  async update(id: number, dto: UpdateBoardPostDto) {
    const existing = await this.findOne(id);
    this.validatePopupWindow(
      dto.isPopup ?? existing.isPopup,
      dto.popupStartAt ?? existing.popupStartAt,
      dto.popupEndAt ?? existing.popupEndAt,
    );

    const merged = this.boardRepository.merge(existing, {
      ...dto,
      popupStartAt:
        dto.popupStartAt !== undefined
          ? dto.popupStartAt
            ? new Date(dto.popupStartAt)
            : null
          : existing.popupStartAt,
      popupEndAt:
        dto.popupEndAt !== undefined
          ? dto.popupEndAt
            ? new Date(dto.popupEndAt)
            : null
          : existing.popupEndAt,
    });
    return this.boardRepository.save(merged);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    await this.boardRepository.remove(existing);
    return { id };
  }
}
