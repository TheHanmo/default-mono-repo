import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from '@modules/user/entity/user.entity';

@Entity('site_settings')
export class SiteSettingsEntity {
  @PrimaryColumn({ type: 'int', default: () => '1', comment: 'Singleton PK (항상 1)' })
  id!: number;

  @Column({
    type: 'time',
    name: 'ad_open_start',
    comment: '광고 오픈 가능 시작 시간',
    default: () => "timezone('utc', now())",
  })
  adOpenStart!: Date;

  @Column({
    type: 'time',
    name: 'ad_open_end',
    comment: '광고 오픈 가능 종료 시간',
    default: () => "timezone('utc', now())",
  })
  adOpenEnd!: string;

  @Column({
    type: 'time',
    name: 'ad_edit_start',
    comment: '광고 수정 가능 시작 시간',
  })
  adEditStart!: string;

  @Column({
    type: 'time',
    name: 'ad_edit_end',
    comment: '광고 수정 가능 종료 시간',
  })
  adEditEnd!: string;

  @Column({
    type: 'time',
    name: 'ad_delete_start',
    comment: '광고 삭제 가능 시작 시간',
  })
  adDeleteStart!: string;

  @Column({
    type: 'time',
    name: 'ad_delete_end',
    comment: '광고 삭제 가능 종료 시간',
  })
  adDeleteEnd!: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
