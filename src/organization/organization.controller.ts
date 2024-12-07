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
import {Request} from 'express';
import {Roles} from 'src/decorator/roles.decorator';
import {Role} from 'src/enum/role.enum';
import {RolesGuard} from 'src/auth/guards/role.guard';
import {UpdateTaskDto} from 'src/task/dto/update-task.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('orgs')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) { }

  @ApiOperation({summary: 'Create a new organization'})
  @Post()
  async createOrganization(@Body() dto: CreateOrgDto, @Req() req: Request) {
    return this.orgService.createOrganization(dto, req.user.id);
  }

  @ApiOperation({summary: 'Get organization by id'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @Get(':org_id')
  async getOrgById(@Param('org_id') org_id: number, @Req() req: Request) {
    const user = await this.orgService.getMemberInOrg(org_id, req.user.id);

    if (user === undefined) {
      throw new ForbiddenException('user is not part of this org');
    } else {
      return this.orgService.findOrgById(org_id);
    }
  }

  @ApiOperation({summary: 'Get all organizations that the user is part of'})
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'per_page',
    description: 'Number of elements per page',
    required: false,
  })
  @Get('')
  async getOrgDetails(
    @Query('page') page: number,
    @Query('per_page') per_page: number,
    @Req() req: Request,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.orgService.findOrgsThatUserIsPartOf(req.user.id, limit, offset);
  }

  @ApiOperation({summary: 'Delete an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id')
  async deleteOrganization(@Param('org_id') id: number) {
    return this.orgService.deleteOrganization(id);
  }

  //********************----USER-RELATED-QUERIES----*************************//

  @ApiOperation({summary: 'Add a member to an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @Post(':org_id/members/invite')
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

  @ApiOperation({summary: 'Get all members of an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiQuery({
    name: 'search',
    description: 'Search for a member',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'per_page',
    description: 'Number of elements per page',
    required: false,
  })
  @Get(':org_id/members')
  async getMembers(
    @Param('org_id') orgId: number,
    @Query('search') search_text?: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.orgService.getMembers(orgId, search_text, offset, limit);
  }

  @ApiOperation({summary: 'Make a user admin in an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/members/:user_id')
  async makeUserAdminInOrg(
    @Param('org_id') orgId: number,
    @Param('user_id') user_id: number,
  ) {
    await this.orgService.makeUserAdminInsideOrg(user_id, orgId);
    return {message: 'operation successfull'};
  }

  @ApiOperation({summary: 'Remove a member from an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/members/:user_id')
  async removeMemberFromOrganization(
    @Param('org_id') orgId: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.removeMember(orgId, user_id);
  }

  //********************----TEAM-RELATED-QUERIES----*************************//

  @ApiOperation({summary: 'Get team details'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Get(':org_id/teams/:team_id')
  async getTeamDetails(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Req() req: Request,
  ) {
    return this.orgService.getTeamDetails(org_id, team_id, req.user.id);
  }

  @ApiOperation({summary: 'Add a team under an organization'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Post(':org_id/teams')
  async addTeamUnderOrg(
    @Param('org_id') org_id: number,
    @Body() createTeamUnderOrgDto: CreateTeamUnderOrgDto,
    @Req() req: Request,
  ) {
    return this.orgService.addTeamUnderOrg(
      {org_id, team_name: createTeamUnderOrgDto.team_name},
      req.user.id,
    );
  }

  @ApiOperation({summary: 'Get all teams that the user is part of'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @Get(':org_id/teams')
  async getTeams(@Param('org_id') org_id: number, @Req() req: Request) {
    return this.orgService.getTeamsThatUserIsPartOf(org_id, req.user.id);
  }

  @ApiOperation({summary: 'Get all members of a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiQuery({
    name: 'search',
    description: 'Search for a member',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'per_page',
    description: 'Number of elements per page',
    required: false,
  })
  @Get(':org_id/teams/:team_id/members')
  async getTeamMemberDetails(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Query('search') search_text?: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return await this.orgService.getTeamMember(
      org_id,
      team_id,
      search_text,
      offset,
      limit,
    );
  }

  @ApiOperation({summary: 'Add a user to a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Post(':org_id/teams/:team_id/members')
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

  @ApiOperation({summary: 'Grant admin role to a user in a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/teams/:team_id/members/:user_id')
  async grantAdminRoleToUserinTeam(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.grantAdminRoleToUserInTeam(org_id, team_id, user_id);
  }

  @ApiOperation({summary: 'Remove a user from a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/teams/:team_id/members/:user_id')
  async removeUserFromTeam(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('user_id') user_id: number,
  ) {
    return this.orgService.removeUserFromTeam(org_id, team_id, user_id);
  }

  //********************----TASK-RELATED-QUERIES----*************************//

  @ApiOperation({summary: 'Create a task'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
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

  @ApiOperation({summary: 'Update a task'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/teams/:team_id/tasks/:task_id')
  async UpdateTask(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
    @Body() updatetaskDto: UpdateTaskDto,
  ) {
    return this.orgService.updateTask(org_id, team_id, task_id, updatetaskDto);
  }

  @ApiOperation({summary: 'Get all tasks of a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Get(':org_id/teams/:team_id/tasks')
  async getTasks(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
  ) {
    return this.orgService.getTasks(org_id, team_id);
  }

  @ApiOperation({summary: 'Get a task by id'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
  @Get(':org_id/teams/:team_id/tasks/:task_id')
  async getTasksById(
    @Param('org_id') org_id: number,
    @Param('team_id') team_id: number,
    @Param('task_id') task_id: number,
  ) {
    return this.orgService.getTaskById(org_id, team_id, task_id);
  }

  @ApiOperation({summary: 'Assign a task to a user'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
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

  @ApiOperation({summary: 'Revoke a task from a user'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
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
