import { DataSource, Repository } from 'typeorm';

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RegisterResponseDto } from '@modules/auth/dto/register-response.dto';
import { CreateRegisterDto } from '@modules/user/dto/create-register.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserRefreshSessionEntity } from '@modules/user/entity/user-refresh-session.entity';

const MAX_SESSIONS = 5;
@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    if (!refreshToken) {
      throw new ConflictException({
        message: '리프레시 토큰이 필요합니다.',
        errorCode: 'REFRESH_TOKEN_REQUIRED',
      });
    }

    await this.dataSource.transaction('READ COMMITTED', async manager => {
      const userRefreshSessionRepository = manager.getRepository(UserRefreshSessionEntity);

      const refresh = userRefreshSessionRepository.create({
        userId: userId,
        refreshToken: refreshToken,
        ip: ip || null,
        userAgent: userAgent || null,
      });

      await userRefreshSessionRepository.save(refresh);

      const alive = await userRefreshSessionRepository
        .createQueryBuilder('s')
        .setLock('pessimistic_write')
        .where('s.user_id = :userId', { userId })
        .orderBy('s.created_at', 'DESC')
        .getMany();

      if (alive.length > MAX_SESSIONS) {
        const toDelete = alive.slice(MAX_SESSIONS);
        const ids = toDelete.map(s => s.id);
        await userRefreshSessionRepository
          .createQueryBuilder()
          .delete()
          .from(UserRefreshSessionEntity)
          .whereInIds(ids)
          .execute();
      }
    });
  }

  async deleteRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .delete()
      .from(UserRefreshSessionEntity)
      .where('userId = :userId', { userId })
      .andWhere('refreshToken = :refreshToken', { refreshToken })
      .execute();
  }

  async create(registerDto: CreateRegisterDto): Promise<RegisterResponseDto> {
    const { email, ...rest } = registerDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 이메일 중복 확인
      const existing = await queryRunner.manager.findOne(UserEntity, {
        where: { email },
      });

      if (existing) {
        throw new ConflictException({
          message: '이미 등록된 이메일입니다.',
          errorCode: 'EMAIL_ALREADY_REGISTERED',
        });
      }
      // 파트너 생성
      const newPartner = this.userRepository.create({
        ...rest,
        email,
      });
      const savedPartner = await queryRunner.manager.save(UserEntity, newPartner);

      await queryRunner.commitTransaction();
      return {
        id: savedPartner.id,
        email: savedPartner.email,
        name: savedPartner.name,
        memberType: savedPartner.memberType,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
