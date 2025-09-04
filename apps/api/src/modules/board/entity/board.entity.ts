import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '@modules/user/entity/user.entity';

@Entity('board')
@Index('idx_board_pinned_created', ['isPinned', 'createdAt'])
@Index('idx_board_popup_period', ['isPopup', 'popupStartAt', 'popupEndAt'])
@Check(
  '"is_popup" = false OR ("popup_start_at" IS NOT NULL AND "popup_end_at" IS NOT NULL AND "popup_start_at" < "popup_end_at")',
)
export class BoardEntity {
  @PrimaryGeneratedColumn({ name: 'id', comment: '게시글 고유번호' })
  @ApiProperty()
  id!: number;

  @Column({ type: 'varchar', length: 200, comment: '제목' })
  @ApiProperty({ maxLength: 200 })
  title!: string;

  @Column({ type: 'text', comment: '내용' })
  @ApiProperty()
  content!: string;

  @Column({ name: 'author_id', type: 'int', comment: '작성자 (회원 고유번호)' })
  @ApiProperty()
  authorId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @Column({ name: 'is_pinned', type: 'boolean', default: false, comment: '고정유무' })
  @ApiProperty({ default: false })
  isPinned!: boolean;

  @Column({ name: 'is_popup', type: 'boolean', default: false, comment: '팝업유무' })
  @ApiProperty({ default: false })
  isPopup!: boolean;

  @Column({ name: 'popup_start_at', type: 'timestamptz', nullable: true, comment: '팝업 시작' })
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  popupStartAt?: Date | null;

  @Column({ name: 'popup_end_at', type: 'timestamptz', nullable: true, comment: '팝업 종료' })
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  popupEndAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', comment: '등록일시' })
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', comment: '수정일시' })
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
