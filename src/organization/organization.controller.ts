import {Controller, Post, Body, Param, Get, Put, Delete, Query} from '@nestjs/common';
import {AddUserToOrgDto, CreateOrgDto, CreateTeamUnderOrgDto} from './dto/organization.dto';
import {OrganizationService} from './organization.service';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';

@Controller('organizations')
export class OrganizationController {

    constructor(private readonly orgService: OrganizationService) { }

    @Post()
    async createOrganization(@Body() dto: CreateOrgDto) {
        return this.orgService.createOrganization(dto);
    }

    @Get(":org_id")
    async getOrgById(@Param("org_id") org_id: number) {
        return this.orgService.findOrgById(org_id);
    }

    @Get("")
    async getOrgDetails(@Query("search") search_text: string, @Query("offset") offset: number, @Query("limit") limit: number) {
        return this.orgService.findOrgs(search_text, offset, limit)
    }

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

    @Put(":org_id/users/:user_id")
    async removeMember(@Param("org_id") orgId: number, @Param("user_id") user_id: number) {
        return this.orgService.removeMember(orgId, user_id)
    }

    @Delete(":org_id")
    async deleteOrganization(@Param("org_id") id: number) {
        return this.orgService.deleteOrganization(id)
    }


    @Post(":org_id/teams")
    async addTeamUnderOrg(@Param("org_id") org_id: number, @Body() createTeamUnderOrgDto: CreateTeamUnderOrgDto) {
        return this.orgService.addTeamUnderOrg({org_id, team_name: createTeamUnderOrgDto.team_name})
    }

    @Get(":org_id/teams")
    async getTeams(@Param("org_id") org_id: number) {
        return this.orgService.getTeams(org_id)
    }

    @Post(":org_id/teams/:team_id/tasks")
    async createTask(@Param("org_id") org_id: number, @Param("team_id") team_id: number, createTaskDto: CreateTaskDto) {
        return this.orgService.createTask(org_id, team_id, createTaskDto)
    }


}

