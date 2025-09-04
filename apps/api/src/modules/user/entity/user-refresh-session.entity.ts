import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@modules/user/entity/user.entity';

@Entity('user_refresh_sessions')
export class UserRefreshSessionEntity {
  @PrimaryGeneratedColumn({ comment: 'PK' })
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Index('idx_user_refresh_sessions_user_id')
  @Column({ name: 'user_id', type: 'int', comment: 'users FK' })
  userId!: number;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '리프레시 토큰',
  })
  refreshToken!: string;

  @Column({ name: 'ip', type: 'varchar', length: 45, nullable: true, comment: '최초 로그인 IP' })
  ip?: string | null;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '브라우저 UA',
  })
  userAgent?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '생성일시',
  })
  createdAt!: Date;
}
