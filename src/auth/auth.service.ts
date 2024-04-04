import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {SelectUser, users} from 'src/drizzle/schemas/users.schema';
import {LoginUserDto} from './dto/auth.dto';
import {UserService} from 'src/user/user.service';
import {compare} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';



@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async login(dto: LoginUserDto) {
        const user = await this.validateUser(dto);
        const payload = {
            username: user.email,
            sub: {
                name: user.name,
                id: user.id
            }
        }
        return {
            user,
            backendTokens: {
                accessToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '1h',
                    secret: process.env.JWT_SECRET_KEY
                }),
                refreshToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.JWT_REFRESH_SECRET_KEY
                }),
            }
        }
    }
    async validateUser(dto: LoginUserDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (user && (await compare(dto.password, user.password))) {
            const {password, ...result} = user;
            return result
        }
        throw new UnauthorizedException()

    }
}
