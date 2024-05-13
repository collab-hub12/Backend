import {Controller, Get, Query, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get()
    async getUsers(@Req() req: IGetUserAuthInfoRequest, @Query("search") search_text?: string, @Query("offset") offset?: number, @Query("limit") limit?: number) {
        return this.userService.getAllUser(search_text, offset, limit)
    }

}
