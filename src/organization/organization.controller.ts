import {Controller, Post, Body} from '@nestjs/common';
import {CreateOrgDto} from './dto/organization.dto';
import {OrganizationService} from './organization.service';

@Controller('organizations')
export class OrganizationController {

    constructor(private readonly orgService: OrganizationService) { }

    @Post()
    async createOrganization(@Body() dto: CreateOrgDto) {
        return this.orgService.createOrganization(dto);
    }


}
