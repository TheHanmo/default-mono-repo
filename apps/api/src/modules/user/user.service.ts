import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MemberType } from '@common/enum/member-type.enum';

import { JwtUser } from '@modules/auth/interfaces/jwt-payload.interface';
import { CreateRegisterDto } from '@modules/user/dto/create-register.dto';
import { UserProfileResponseDto } from '@modules/user/dto/user-profile-response.dto';
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
      relations: ['company'],
    });
  }

  async findByRefreshToken(userId: number): Promise<UserRefreshSessionEntity[] | null> {
    return this.dataSource.getRepository(UserRefreshSessionEntity).find({ where: { userId } });
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

  async register(
    userInfo: JwtUser,
    registerDto: CreateRegisterDto,
  ): Promise<UserProfileResponseDto> {
    const { userId } = userInfo;
    const { email, password } = registerDto;

    const user = await this.findById(userId);
    if (!user) {
      throw new ConflictException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const memberType = user.memberType;

    if (memberType === MemberType.SUPER_ADMIN) {
      registerDto.memberType = MemberType.DISTRIBUTOR;
    } else if (memberType === MemberType.DISTRIBUTOR) {
      registerDto.memberType = MemberType.AGENT;
      registerDto.companyId = user.companyId;
    } else if (memberType === MemberType.AGENT) {
      registerDto.memberType = MemberType.GENERAL;
      registerDto.companyId = user.companyId;
    }

    const userExists = await this.findByEmail(email);

    if (userExists) {
      throw new ConflictException({
        message: '이미 등록된 이메일입니다.',
        errorCode: 'EMAIL_ALREADY_REGISTERED',
      });
    }

    registerDto.password = await bcrypt.hash(password, 10);
    const result = await this.createUser(registerDto);

    return {
      id: result.id,
      email: result.email,
      memberType: result.memberType,
      memo: result.memo,
    };
  }

  async createUser(registerDto: CreateRegisterDto): Promise<UserProfileResponseDto> {
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

      const newUser = this.userRepository.create({
        ...rest,
        email,
      });
      const savedUser = await queryRunner.manager.save(UserEntity, newUser);

      await queryRunner.commitTransaction();
      return {
        id: savedUser.id,
        email: savedUser.email,
        memberType: savedUser.memberType,
        memo: savedUser.memo,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(
    accessUserInfo: JwtUser,
    updateUserId: number,
    updateData: Partial<UserEntity>,
  ): Promise<void> {
    const { userId } = accessUserInfo;

    const accessUser = await this.findById(userId);
    if (!accessUser) {
      throw new ConflictException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const updateUser = await this.findById(updateUserId);
    if (!updateUser) {
      throw new ConflictException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    try {
      await this.userRepository.update(updateUserId, updateData);
    } catch {
      throw new ConflictException({
        message: '사용자 정보 업데이트 중 오류가 발생했습니다.',
        errorCode: 'USER_UPDATE_ERROR',
      });
    }
  }

  async deleteUser(accessUserInfo: JwtUser, deleteUserId: number): Promise<void> {
    const { userId } = accessUserInfo;

    const accessUser = await this.findById(userId);
    if (!accessUser) {
      throw new ConflictException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const deleteUser = await this.findById(deleteUserId);
    if (!deleteUser) {
      throw new ConflictException({
        message: '사용자를 찾을 수 없습니다.',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    if (deleteUser.memberType === MemberType.SUPER_ADMIN) {
      throw new ConflictException({
        message: '슈퍼 어드민은 삭제할 수 없습니다.',
        errorCode: 'CANNOT_DELETE_SUPER_ADMIN',
      });
    }

    try {
      await this.userRepository.delete(deleteUserId);
    } catch {
      throw new ConflictException({
        message: '사용자 정보 삭제 중 오류가 발생했습니다.',
        errorCode: 'USER_DELETE_ERROR',
      });
    }
  }
}
