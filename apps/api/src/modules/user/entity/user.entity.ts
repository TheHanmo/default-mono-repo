import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MemberType } from '@common/enum/member-type.enum';

import { CompanyEntity } from '@modules/company/companies.entity';

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

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId!: number;

  @ManyToOne(() => CompanyEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;

  @Column({
    name: 'member_type',
    type: 'enum',
    enum: MemberType,
    default: MemberType.GENERAL,
    comment: '회원 종류',
  })
  memberType!: MemberType;

  @Column({ name: 'memo', type: 'varchar', length: 255, nullable: true, comment: '메모' })
  memo?: string;

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
