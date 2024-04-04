import {Controller, Post, Body, Param, Get, Put, Delete, Query} from '@nestjs/common';
import {AddUserToOrgDto, CreateOrgDto} from './dto/organization.dto';
import {OrganizationService} from './organization.service';

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
}

