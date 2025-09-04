import { SetMetadata } from '@nestjs/common';

import { MemberType } from '@common/enum/member-type.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MemberType[]) => SetMetadata(ROLES_KEY, roles);
