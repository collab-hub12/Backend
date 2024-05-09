import {Controller, Get, Param, Req, UseGuards} from '@nestjs/common';
import {UserService} from './user.service';
import {AuthGuard} from '@nestjs/passport';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {JwtAuthGuard} from 'src/auth/guards/auth.guard';

@Controller('users')
export class UserController {

    constructor() { }

    @Get("")
    @UseGuards(JwtAuthGuard)
    async getUserProfile(@Req() req: IGetUserAuthInfoRequest) {
        return req.user
    }
}
