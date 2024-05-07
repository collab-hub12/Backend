import {Body, Controller, Req, Post, Get, UseGuards, Res} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
import {LoginUserDto} from './dto/auth.dto';
import {GoogleOauthGuard} from './guards/google-oauth.guard';
import {Role} from 'src/enum/role.enum';

export interface IGetUserAuthInfoRequest extends Request {
    user: {
        id: number,
        name: string,
        email: string,
        picture: string,
        roles: Role[]
    }
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

    }


    @Get('google/callback')
    @UseGuards(GoogleOauthGuard)
    async handleRedirect(@Res({passthrough: true}) res: Response, @Req() req: IGetUserAuthInfoRequest) {

        const {accessToken} = await this.authService.signIn(req.user)

        res.cookie('jwt', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
        });

        return req.user;
    }
}
