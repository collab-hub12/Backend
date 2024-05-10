import {Controller, Post, Body, Param, Get, Put, Delete, Query, UseGuards, Req} from '@nestjs/common';
import {AddUserToOrgDto, CreateOrgDto, CreateTeamUnderOrgDto} from './dto/organization.dto';
import {OrganizationService} from './organization.service';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';
import {AssignTaskDto} from 'src/task/dto/assign-task.dto';
import {RevokeTaskDto} from 'src/task/dto/revoke-task.dto';
import {JwtAuthGuard} from 'src/auth/guards/auth.guard';
import {IGetUserAuthInfoRequest} from 'src/auth/auth.controller';
import {Roles} from 'src/decorator/roles.decorator';
import {Role} from 'src/enum/role.enum';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationController {

    constructor(private readonly orgService: OrganizationService) { }

    @Post()
    async createOrganization(@Body() dto: CreateOrgDto, @Req() req: IGetUserAuthInfoRequest) {
        return this.orgService.createOrganization(dto, req.user.id);
    }


    @Get(":org_id")
    async getOrgById(@Param("org_id") org_id: number) {
        return this.orgService.findOrgById(org_id);
    }

    @Get("")
    async getOrgDetails(@Query("offset") offset: number, @Query("limit") limit: number, @Req() req: IGetUserAuthInfoRequest) {
        return this.orgService.findOrgsThatUserIsPartOf(req.user.id, offset, limit)
    }

    @Roles(Role.ORG_ADMIN)
    @Delete(":org_id")
    async deleteOrganization(@Param("org_id") id: number) {
        return this.orgService.deleteOrganization(id)
    }

    //********************----USER-RELATED-QUERIES----*************************//

    @Roles(Role.ORG_ADMIN)
    @Post(":org_id/users")
    async addMemberToOrganization(@Param("org_id") org_id: number, @Body() dto: AddUserToOrgDto) {
        await this.orgService.addMember(org_id, dto)
        return {
            "message": "users added successfully"
        }
    }


    @Get(":org_id/users")
    async getMembers(@Param("org_id") orgId: number) {
        return this.orgService.getMembers(orgId)
    }

    @Roles(Role.ORG_ADMIN)
    @Put(":org_id/users/:user_id")
    async removeMemberFromOrganization(@Param("org_id") orgId: number, @Param("user_id") user_id: number) {
        return this.orgService.removeMember(orgId, user_id)
    }

    //********************----TEAM-RELATED-QUERIES----*************************//

    @Roles(Role.ORG_ADMIN)
    @Post(":org_id/teams")
    async addTeamUnderOrg(@Param("org_id") org_id: number, @Body() createTeamUnderOrgDto: CreateTeamUnderOrgDto, @Req() req: IGetUserAuthInfoRequest) {
        return this.orgService.addTeamUnderOrg({org_id, team_name: createTeamUnderOrgDto.team_name}, req.user.id)
    }


    @Get(":org_id/teams")
    async getTeams(@Param("org_id") org_id: number, @Req() req: IGetUserAuthInfoRequest) {
        return this.orgService.getTeamsThatUserIsPartOf(org_id, req.user.id)
    }


    @Get(":org_id/teams/:team_name")
    async getTeamMemberDetails(@Param("org_id") org_id: number, @Param("team_name") team_name: string) {
        return this.orgService.getTeamMember(org_id, team_name)
    }

    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Put(":org_id/teams/:team_name/users/:users_id")
    async addUserToATeam(@Param("org_id") org_id: number, @Param("team_name") team_name: string, @Param("users_id") users_id: number) {
        return this.orgService.addUserToATeam(org_id, team_name, users_id);
    }

    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Delete(":org_id/teams/:team_name/users/:users_id")
    async removeUserFromTeam(@Param("org_id") org_id: number, @Param("team_name") team_name: string, @Param("users_id") users_id: number) {
        return this.orgService.removeUserFromTeam(org_id, team_name, users_id);
    }

    //********************----TASK-RELATED-QUERIES----*************************//

    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Post(":org_id/teams/:team_name/tasks")
    async createTask(@Param("org_id") org_id: number, @Param("team_name") team_name: string, @Body() createTaskDto: CreateTaskDto) {
        return this.orgService.createTask(org_id, team_name, createTaskDto)
    }


    @Get(":org_id/teams/:team_name/tasks")
    async getTasks(@Param("org_id") org_id: number, @Param("team_name") team_name: string) {
        return this.orgService.getTasks(org_id, team_name)
    }

    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Post(":org_id/teams/:team_name/tasks/:task_id")
    async assignTask(@Param("org_id") org_id: number, @Param("team_name") team_name: string, @Param("task_id") task_id: number, @Body() assigntaskdto: AssignTaskDto) {
        return this.orgService.assignTask(org_id, team_name, task_id, assigntaskdto.assignee_id)
    }

    @Roles(Role.ORG_ADMIN, Role.TEAM_ADMIN)
    @Put(":org_id/teams/:team_name/tasks/:task_id")
    async revokeTask(@Param("org_id") org_id: number, @Param("team_name") team_name: string, @Param("task_id") task_id: number, @Body() revoketaskdto: RevokeTaskDto) {
        return this.orgService.revokeTask(org_id, team_name, task_id, revoketaskdto.revoked_from)
    }

}
