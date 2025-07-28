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
} from '@nestjs/common';
import {
  AddUserToTeamDto,
  CreateTeamUnderOrgDto,
} from '../dto/organization.dto';
import {OrganizationService} from '../organization.service';
import {Request} from 'express';
import {Roles} from 'src/common/decorator/roles.decorator';
import {Role} from 'src/common/enum/role.enum';
import {RolesGuard} from 'src/auth/guards/role.guard';
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
export class OrganizationTeamController {
  constructor(private readonly orgService: OrganizationService) { }

  //********************----TEAM-RELATED-QUERIES----*************************//

  @ApiOperation({summary: 'Get team details'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Get(':org_id/teams/:team_id')
  async getTeamDetails(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
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
    @Param('org_id') org_id: string,
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
  async getTeams(
    @Param('org_id') org_id: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.orgService.getTeamsThatUserIsPartOf(
      org_id,
      req.user.id,
      offset,
      limit,
    );
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
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
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
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
    @Body() addUserTeamDTO: AddUserToTeamDto,
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
  @Put(':org_id/teams/:team_id/members/:user_id/roles')
  async grantAdminRoleToUserinTeam(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
    @Param('user_id') user_id: string,
  ) {
    return this.orgService.grantAdminRoleToUserInTeam(org_id, team_id, user_id);
  }

  @ApiOperation({summary: 'Revoke admin role from user in a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/teams/:team_id/members/:user_id/roles')
  async revokeAdminRoleFromUserinTeam(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
    @Param('user_id') user_id: string,
  ) {
    return this.orgService.revokeAdminRoleInTeam(org_id, team_id, user_id);
  }

  @ApiOperation({summary: 'Get drawing board state for a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Get(':org_id/teams/:team_id/drawingboard')
  async getDrawingBoardState(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
  ) {
    return this.orgService.getDrawingBoardState(org_id, team_id);
  }

  @ApiOperation({summary: 'Remove a user from a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @ApiParam({name: 'user_id', description: 'User ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/teams/:team_id/members/:user_id')
  async removeUserFromTeam(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
    @Param('user_id') user_id: string,
  ) {
    return this.orgService.removeUserFromTeam(org_id, team_id, user_id);
  }

  @ApiOperation({summary: 'Remove a team'})
  @ApiParam({name: 'org_id', description: 'Organization ID'})
  @ApiParam({name: 'team_id', description: 'Team ID'})
  @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/teams/:team_id')
  async removeTeam(
    @Param('org_id') org_id: string,
    @Param('team_id') team_id: string,
  ) {
    return this.orgService.removeTeam(team_id);
  }
}
