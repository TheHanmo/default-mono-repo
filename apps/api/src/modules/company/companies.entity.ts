import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyType } from '@common/enum/company-type.enum';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true, comment: '회사/조직 이름' })
  name!: string;

  @Index()
  @Column({ type: 'enum', enum: CompanyType, comment: '회사 타입(본사/총판/대행사)' })
  type!: CompanyType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  memo?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
