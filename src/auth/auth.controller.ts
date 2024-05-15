import {Body, Controller, Req, Post, Get, UseGuards, Res, Query} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
import {LoginUserDto} from './dto/auth.dto';
import {GoogleOauthGuard} from './guards/google-oauth.guard';
import {Role} from 'src/enum/role.enum';
import {JwtAuthGuard} from './guards/auth.guard';
import {OrganizationService} from 'src/organization/organization.service';
import {TeamService} from 'src/team/team.service';
import {RoomService} from 'src/room/room.service';
import {JwtService} from '@nestjs/jwt';

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
        private readonly authService: AuthService,
        private readonly orgService: OrganizationService,
        private readonly teamService: TeamService,
        private readonly roomService: RoomService,
        private readonly jwtService: JwtService
    ) { }

    @Post('register')
    async registerUser(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserProfile(@Req() req: IGetUserAuthInfoRequest, @Res({passthrough: true}) res: Response, @Query('org_id') org_id?: number, @Query('team_id') team_id?: number, @Query('room_id') room_id?: number) {
        let role_details = [];
        // check if user is admin inside org
        if (org_id) {
            const result = await this.orgService.getMemberInOrg(org_id, req.user.id)
            if (result?.is_admin) role_details.push(Role.ORG_ADMIN)
        }

        // check if user is admin inside team
        if (team_id) {
            const result = await this.teamService.getUserinTeaminOrg(org_id, req.user.id, team_id)
            if (result?.is_admin) role_details.push(Role.TEAM_ADMIN)
        }
        // check if user is admin inside role
        if (room_id) {
            const result = await this.roomService.getUsersinRoom(req.user.id, room_id)
            if (result?.is_admin) role_details.push(Role.ROOM_ADMIN)
        }
        const jwtPayload = {
            sub: req.user.id,
            picture: req.user.picture,
            name: req.user.name,
            email: req.user.email,
            roles: role_details
        }
        const token = this.jwtService.sign(jwtPayload, {secret: process.env.JWT_SECRET})

        res.cookie('jwt', token, {
            httpOnly: true,
        });

        req.user.roles = role_details

        return {...req.user, token}
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
        });

        return res.redirect("http://127.0.0.1:3000");
    }

    @Get('logout')
    async logoutHandler(@Req() req: IGetUserAuthInfoRequest, @Res() res: Response) {
        res.clearCookie('jwt')
        res.redirect("http://127.0.0.1:3000")
    }
}
