import {Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {Role} from 'src/enum/role.enum';

export type JwtPayload = {sub: number; email: string, roles: Role[]};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const extractJwtFromCookie = (req: any) => {
            let token = null;

            if (req && req.cookies) {
                token = req.cookies.jwt;
            }
            return token;
        };

        super({
            jwtFromRequest: extractJwtFromCookie,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload) {
        return {id: payload.sub, email: payload.email, roles: payload.roles};
    }
}