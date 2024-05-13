import {BadRequestException, Body, Controller, Get, Query, Req, Res, UseGuards} from '@nestjs/common';
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
  async getRoles(@Req() req: IGetUserAuthInfoRequest, @Res({passthrough: true}) res: Response, @Query('org_id') org_id?: number, @Query('team_id') team_id?: number, @Query('room_id') room_id?: number) {
    let role_details = [];
    // check if user is admin inside org
    const result = await this.orgService.getMemberInOrg(org_id, req.user.id)
    if (result?.is_admin) role_details.push(Role.ORG_ADMIN)
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
