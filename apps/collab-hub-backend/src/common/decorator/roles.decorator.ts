import {SetMetadata} from '@nestjs/common';
import {Role} from 'src/common/enum/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
