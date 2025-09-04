import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MemberType } from '@common/enum/member-type.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    comment: '회원 고유 번호',
  })
  id!: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '회원 이메일 (로그인 ID)',
  })
  email!: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    comment: '비밀번호 (해시된 값)',
  })
  password!: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '회원 이름',
  })
  name!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '휴대폰 번호',
  })
  phoneNumber?: string | null;

  @Column({
    name: 'member_type',
    type: 'enum',
    enum: MemberType,
    default: MemberType.GENERAL,
    comment: '회원 종류',
  })
  memberType!: MemberType;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '등록일시',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    comment: '수정일시',
  })
  updatedAt!: Date;
}
