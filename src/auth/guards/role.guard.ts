import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Role} from "src/enum/role.enum";
import {IGetUserAuthInfoRequest} from "../auth.controller";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    matchRoles(roles: string[], userRole: string) {
        return roles.some(role => role === userRole)
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const {user} = context.switchToHttp().getRequest<IGetUserAuthInfoRequest>();
        console.log("hi", user);

        return requiredRoles.some((role) => user?.roles?.includes(role));
    }
}
