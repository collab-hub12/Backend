import {Body, Controller, Req, Post, Get, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
import {LoginUserDto} from './dto/auth.dto';
import {AuthGuard} from './guards/auth.guard';
import {GoogleOauthGuard} from './guards/google-oauth.guard';

export interface IGetUserAuthInfoRequest extends Request {
    user: string // or any other type
}


@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService,
        private readonly authService: AuthService) { }

    @Post('register')
    async registerUser(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }



    @Get('login')
    @UseGuards(GoogleOauthGuard)
    async login(@Body() dto: LoginUserDto) {
        return this.authService.login(dto)
    }


    @Get('google/callback')
    @UseGuards(GoogleOauthGuard)
    handleRedirect(@Req() req: IGetUserAuthInfoRequest) {
        return req.user;
    }
}
