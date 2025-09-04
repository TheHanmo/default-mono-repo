import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateBoardPostDto } from './dto/create-board-post.dto';
import { ListBoardPostDto } from './dto/list-board-post.dto';
import { UpdateBoardPostDto } from './dto/update-board-post.dto';
import { BoardEntity } from './entity/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardEntityRepository: Repository<BoardEntity>,
  ) {}

  private validatePopupWindow(
    isPopup?: boolean,
    start?: string | Date | null,
    end?: string | Date | null,
  ) {
    if (!isPopup) return; // 미사용
    if (!start || !end)
      throw new BadRequestException('팝업 기간이 필요합니다. (popupStartAt, popupEndAt)');
    const s = new Date(start);
    const e = new Date(end);
    if (!(s < e)) throw new BadRequestException('팝업 종료일은 시작일보다 커야 합니다.');
  }

  async create(dto: CreateBoardPostDto) {
    this.validatePopupWindow(dto.isPopup, dto.popupStartAt, dto.popupEndAt);
    const entity = this.boardEntityRepository.create({
      title: dto.title,
      content: dto.content,
      authorId: dto.authorId,
      isPinned: dto.isPinned ?? false,
      isPopup: dto.isPopup ?? false,
      popupStartAt: dto.popupStartAt ? new Date(dto.popupStartAt) : null,
      popupEndAt: dto.popupEndAt ? new Date(dto.popupEndAt) : null,
    });
    return this.boardEntityRepository.save(entity);
  }

  async findAll(query: ListBoardPostDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.isPinned', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (query.keyword) {
      qb.andWhere('(p.title ILIKE :kw OR p.content ILIKE :kw)', { kw: `%${query.keyword}%` });
    }

    if (query.popupActiveOnly) {
      qb.andWhere('p.isPopup = true AND p.popupStartAt <= :now AND p.popupEndAt >= :now', {
        now: new Date(),
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const found = await this.boardEntityRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!found) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    return found;
  }

  async update(id: number, dto: UpdateBoardPostDto) {
    const existing = await this.findOne(id);
    this.validatePopupWindow(
      dto.isPopup ?? existing.isPopup,
      dto.popupStartAt ?? existing.popupStartAt,
      dto.popupEndAt ?? existing.popupEndAt,
    );

    const merged = this.boardEntityRepository.merge(existing, {
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
    return this.boardEntityRepository.save(merged);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    await this.boardEntityRepository.remove(existing);
    return { id };
  }
}
