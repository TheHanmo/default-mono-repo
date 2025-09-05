import { ApiResponseDto } from '@app-types/api-response.type';
import { Request as ExpressRequest } from 'express';

import { Body, Controller, Delete, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@common/decorators/roles.decorator';
import { MemberType } from '@common/enum/member-type.enum';

import { responseSuccess } from '@utils/response.util';

import { JwtUser } from '@modules/auth/interfaces/jwt-payload.interface';
import { CreateRegisterDto } from '@modules/user/dto/create-register.dto';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { UserProfileResponseDto } from '@modules/user/dto/user-profile-response.dto';
import { UserService } from '@modules/user/user.service';

@ApiTags('User')
@Controller({
  path: 'user',
  version: 'v1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Roles(MemberType.SUPER_ADMIN, MemberType.DISTRIBUTOR, MemberType.AGENT)
  @ApiOperation({
    summary: '회원가입',
    description:
      '이메일과 비밀번호를 사용하여 회원가입 합니다. <br/><br/>Function: authRegister <br/> Dto: CreateRegisterDto <br/> Response: UserProfileResponseDto',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: UserProfileResponseDto,
  })
  async register(
    @Request() req: ExpressRequest & { user: JwtUser },
    @Body() dto: CreateRegisterDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const userInfo = req.user;
    const result = await this.userService.register(userInfo, dto);

    return responseSuccess(result, '회원가입이 완료되었습니다.');
  }

  @Patch('update/:update_user_id')
  @Roles(MemberType.SUPER_ADMIN, MemberType.DISTRIBUTOR, MemberType.AGENT)
  @ApiOperation({
    summary: '회원 정보 수정',
    description:
      '회원 정보를 수정합니다. <br/><br/>Function: updateUser <br/> Dto: UpdateUserDto <br/> Response: null',
  })
  @ApiResponse({
    status: 200,
    description: '회원 정보 수정 성공',
  })
  async updateUser(
    @Request() req: ExpressRequest & { user: JwtUser },
    @Param('update_user_id') updateUserId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponseDto<null>> {
    const accessUserInfo = req.user;

    await this.userService.updateUser(accessUserInfo, updateUserId, dto);

    return responseSuccess(null, '회원 정보가 수정되었습니다.');
  }

  @Delete('delete/:delete_user_id')
  @Roles(MemberType.SUPER_ADMIN, MemberType.DISTRIBUTOR, MemberType.AGENT)
  @ApiOperation({
    summary: '회원 삭제',
    description:
      '회원을 삭제합니다. <br/><br/>Function: deleteUser <br/> Dto: null <br/> Response: null',
  })
  @ApiResponse({
    status: 200,
    description: '회원 삭제 성공',
  })
  async deleteUser(
    @Request() req: ExpressRequest & { user: JwtUser },
    @Param('delete_user_id') deleteUserId: number,
  ): Promise<ApiResponseDto<null>> {
    const accessUserInfo = req.user;

    await this.userService.deleteUser(accessUserInfo, deleteUserId);

    return responseSuccess(null, '회원이 삭제되었습니다.');
  }
}
