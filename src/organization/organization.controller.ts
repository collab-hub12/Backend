import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  AddUserToOrgDto,
  CreateOrgDto,
  CreateTeamUnderOrgDto,
} from './dto/organization.dto';
import {OrganizationService} from './organization.service';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';
import {AssignTaskDto} from 'src/task/dto/assign-task.dto';
import {RevokeTaskDto} from 'src/task/dto/revoke-task.dto';
import {JwtAuthGuard} from 'src/auth/guards/auth.guard';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {Roles} from 'src/decorator/roles.decorator';
import {Role} from 'src/enum/role.enum';
import {RolesGuard} from 'src/auth/guards/role.guard';
import {UpdateTaskDto} from 'src/task/dto/update-task.dto';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) { }

  @Post()
  async createOrganization(
    @Body() dto: CreateOrgDto,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    return this.orgService.createOrganization(dto, req.user.id);
  }

  @Get(':org_id')
  async getOrgById(
    @Param('org_id') org_id: number,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    const user = await this.orgService.getMemberInOrg(org_id, req.user.id);

    if (user === undefined) {
      throw new ForbiddenException('user is not part of this org');
    } else {
      return this.orgService.findOrgById(org_id);
    }
  }

  @Get('')
  async getOrgDetails(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    return this.orgService.findOrgsThatUserIsPartOf(req.user.id, offset, limit);
  }

  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id')
  async deleteOrganization(@Param('org_id') id: number) {
    return this.orgService.deleteOrganization(id);
  }

  //********************----USER-RELATED-QUERIES----*************************//

  @Post(':org_id/users')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async addMemberToOrganization(
    @Param('org_id') org_id: number,
    @Body() dto: AddUserToOrgDto,
  ) {
    await this.orgService.SendInvitation(org_id, dto);
    return {
      message: 'Invitation sent to the user successfully',
    };
  }



  @Get(':org_id/users')
  async getMembers(
    @Param('org_id') orgId: number,
    @Query('search') search_text?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orgService.getMembers(orgId, search_text, offset, limit);
  }

  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/users/:user_id')
  async makeUserAdminInOrg(
    @Param('org_id') orgId: number,
    @Param('user_id') user_id: number,
  ) {
    await this.orgService.makeUserAdminInsideOrg(user_id, orgId);
    return {message: 'operation successfull'};
  }

  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/users/:user_id')
  async removeMemberFromOrganization(
    @Param('org_id') orgId: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.removeMember(orgId, user_id);
  }

  //********************----TEAM-RELATED-QUERIES----*************************//

  @Get(':org_id/teams/:team_name')
  async getTeamDetails(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    return this.orgService.getTeamDetails(org_id, team_id, req.user.id);
  }

  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Post(':org_id/teams')
  async addTeamUnderOrg(
    @Param('org_id') org_id: number,
    @Body() createTeamUnderOrgDto: CreateTeamUnderOrgDto,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    return this.orgService.addTeamUnderOrg(
      {org_id, team_name: createTeamUnderOrgDto.team_name},
      req.user.id,
    );
  }

  @Get(':org_id/teams')
  async getTeams(
    @Param('org_id') org_id: number,
    @Req() req: IGetUserAuthInfoRequest,
  ) {
    return this.orgService.getTeamsThatUserIsPartOf(org_id, req.user.id);
  }

  @Get(':org_id/teams/:team_id/users')
  async getTeamMemberDetails(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Query('search') search_text?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ) {

    return await this.orgService.getTeamMember(
      org_id,
      team_id,
      search_text,
      offset,
      limit,
    );
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Post(':org_id/teams/:team_id/users')
  async addUserToATeam(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Body() addUserTeamDTO: AddUserToOrgDto,
  ) {
    return this.orgService.addUserToATeam(
      org_id,
      team_id,
      addUserTeamDTO.user_id,
    );
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/teams/:team_id/users/:user_id')
  async grantAdminRoleToUserinTeam(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.grantAdminRoleToUserInTeam(
      org_id,
      team_id,
      user_id,
    );
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/teams/:team_id/users/:user_id')
  async removeUserFromTeam(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.removeUserFromTeam(org_id, team_id, user_id);
  }

  //********************----TASK-RELATED-QUERIES----*************************//

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Post(':org_id/teams/:team_id/tasks')
  async createTask(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.orgService.createTask(org_id, team_id, createTaskDto);
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/teams/:team_id/tasks/:task_id')
  async UpdateTask(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
    @Body() updatetaskDto: UpdateTaskDto,
  ) {
    return this.orgService.updateTask(
      org_id,
      team_id,
      task_id,
      updatetaskDto,
    );
  }

  @Get(':org_id/teams/:team_id/tasks')
  async getTasks(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
  ) {
    return this.orgService.getTasks(org_id, team_id);
  }

  @Get(':org_id/teams/:team_id/tasks/:task_id')
  async getTasksById(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
  ) {
    return this.orgService.getTaskById(org_id, team_id, task_id);
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @Post(':org_id/teams/:team_id/tasks/:task_id')
  async assignTask(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
    @Body() assigntaskdto: AssignTaskDto,
  ) {
    return this.orgService.assignTask(
      org_id,
      team_id,
      task_id,
      assigntaskdto.assignee_id,
    );
  }

  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @Put(':org_id/teams/:team_id/tasks/:task_id')
  async revokeTask(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
    @Body() revoketaskdto: RevokeTaskDto,
  ) {
    return this.orgService.revokeTask(
      org_id,
      team_id,
      task_id,
      revoketaskdto.revoked_from,
    );
  }
}
