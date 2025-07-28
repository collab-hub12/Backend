import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enum/role.enum';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role === userRole);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user, params } = context.switchToHttp().getRequest();

    if (
      params.org_id &&
      requiredRoles.includes(Role.ORG_ADMIN) &&
      !(await this.roleService.isOrgAdmin(params.org_id, user.id))
    ) {
      throw new ForbiddenException(
        'You are not authorized to access this Organization resource',
      );
    }
    if (
      params.team_id &&
      requiredRoles.includes(Role.TEAM_ADMIN) &&
      !(await this.roleService.isTeamAdmin(params.team_id, user.id))
    ) {
      throw new ForbiddenException(
        'You are not authorized to access this Team resource',
      );
    }

    return true;
  }
}
