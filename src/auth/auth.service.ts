import {Injectable} from '@nestjs/common';

import {UserService} from 'src/user/user.service';
import {JwtService} from '@nestjs/jwt';
import {CreateUserDto} from 'src/user/dto/user.dto';



@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    generateJwt(payload: any) {
        return this.jwtService.sign(payload, {secret: process.env.JWT_SECRET})
    }

    async signIn(user: CreateUserDto) {
        let userExists = await this.userService.findByEmail(user.email)

        if (!userExists) {
            userExists = await this.userService.create(user);
        }

        const token = this.generateJwt({
            sub: userExists.id,
            email: userExists.email
        })

        return {
            accessToken: token
        }
    }


    async validateUser(dto: CreateUserDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (user) {
            return user
        }
        const NewUser = await this.userService.create(dto)
        return NewUser
    }
}
