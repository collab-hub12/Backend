import {BadRequestException, Body, Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {RoleService} from './role.service';
import {JwtAuthGuard} from 'src/auth/guards/auth.guard';
import {OrganizationService} from 'src/organization/organization.service';
import {TeamService} from 'src/team/team.service';
import {RoomService} from 'src/room/room.service';
import {GetRolesDto} from './dto/roles.dto';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {JwtService} from '@nestjs/jwt';
import {Response} from 'express';
import {Role} from 'src/enum/role.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly teamService: TeamService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService
  ) { }

  @Get()
  async getRoles(@Body() dto: GetRolesDto, @Req() req: IGetUserAuthInfoRequest, @Res({passthrough: true}) res: Response) {
    let role_details = [];

    if (dto.org_id) {
      console.log(req.user);

      const {is_admin} = await this.orgService.getMemberInOrg(dto.org_id, req.user.id)
      if (is_admin) role_details.push(Role.ORG_ADMIN)

    }
    if (dto.team_id) {
      const {is_admin} = await this.teamService.getUserinTeaminOrg(dto.org_id, req.user.id, dto.team_id)
      if (is_admin) role_details.push(Role.TEAM_ADMIN)
    }

    if (dto.room_id) {
      const {is_admin} = await this.roomService.getUsersinRoom(req.user.id, dto.room_id)
      if (is_admin) role_details.push(Role.ROOM_ADMIN)
    }


    const jwtPayload = {
      sub: req.user.id,
      email: req.user.email,
      roles: role_details
    }

    const token = this.jwtService.sign(jwtPayload, {secret: process.env.JWT_SECRET})

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
    })

    req.user = {...req.user, roles: role_details}
    console.log(req.user);


    return req.user

  }
}
