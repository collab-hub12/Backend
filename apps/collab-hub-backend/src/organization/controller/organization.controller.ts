import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateOrgDto,
} from '../dto/organization.dto';
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
import {OrganizationService} from '../organization.service';

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
  async getOrgById(@Param('org_id') org_id: string, @Req() req: Request) {
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
  async deleteOrganization(@Param('org_id') id: string) {
    return this.orgService.deleteOrganization(id);
  }
}
