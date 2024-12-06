import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { OrganizationModule } from 'src/organization/organization.module';
import { TeamModule } from 'src/team/team.module';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';

@Module({
  imports: [OrganizationModule, TeamModule],
  controllers: [RoleController],
  providers: [RoleService, ...drizzleProvider],
  exports: [RoleService],
})
export class RoleModule {}
