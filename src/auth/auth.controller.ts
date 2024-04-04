import {Body, Controller, Get, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
import {LoginUserDto} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService,
        private readonly authService: AuthService) { }

    @Post('register')
    async registerUser(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginUserDto) {
        return this.authService.login(dto)
    }
}
