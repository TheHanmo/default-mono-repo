import { MemberType } from '@common/enum/member-type.enum';

export class RegisterResponseDto {
  id!: number;
  email!: string;
  name!: string;
  memberType!: MemberType;
}
