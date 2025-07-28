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
} from '@nestjs/common';
import { OrganizationService } from '../organization.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AddUserToOrgDto } from '../dto/organization.dto';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('orgs')
export class OrganizationMemberController {
  constructor(private readonly orgService: OrganizationService) {}

  //********************----Member-RELATED-QUERIES----*************************//

  @ApiOperation({ summary: 'Add a member to an organization' })
  @ApiParam({ name: 'org_id', description: 'Organization ID' })
  @Post(':org_id/members/invite')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async addMemberToOrganization(
    @Param('org_id') org_id: string,
    @Body() dto: AddUserToOrgDto,
  ) {
    await this.orgService.SendInvitation(org_id, dto.user_email);

    return {
      message: 'Invitation sent to the user successfully',
    };
  }

  @ApiOperation({ summary: 'Get all members of an organization' })
  @ApiParam({ name: 'org_id', description: 'Organization ID' })
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
    @Param('org_id') orgId: string,
    @Query('search') search_text?: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.orgService.getMembers(orgId, search_text, offset, limit);
  }

  @ApiOperation({ summary: 'Make a user admin in an organization' })
  @ApiParam({ name: 'org_id', description: 'Organization ID' })
  @ApiParam({ name: 'user_id', description: 'User ID' })
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Put(':org_id/members/:user_id/roles')
  async makeUserAdminInOrg(
    @Param('org_id') orgId: string,
    @Param('user_id') user_id: string,
  ) {
    await this.orgService.makeUserAdminInsideOrg(user_id, orgId);
    return { message: 'operation successfull' };
  }

  @ApiOperation({ summary: 'Revoke admin role in an organization' })
  @ApiParam({ name: 'org_id', description: 'Organization ID' })
  @ApiParam({ name: 'user_id', description: 'User ID' })
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/members/:user_id/roles')
  async RevokeAdminRoleInOrg(
    @Param('org_id') orgId: string,
    @Param('user_id') user_id: string,
  ) {
    await this.orgService.revokeAdminRoleInsideOrg(user_id, orgId);
    return { message: 'operation successfull' };
  }

  @ApiOperation({ summary: 'Remove a member from an organization' })
  @ApiParam({ name: 'org_id', description: 'Organization ID' })
  @ApiParam({ name: 'user_id', description: 'User ID' })
  @Roles(Role.ORG_ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':org_id/members/:user_id')
  async removeMemberFromOrganization(
    @Param('org_id') orgId: string,
    @Param('user_id') user_id: string,
  ) {
    return this.orgService.removeMember(orgId, user_id);
  }
}
