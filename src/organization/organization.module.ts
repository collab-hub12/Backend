import { forwardRef, Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { TeamModule } from 'src/team/team.module';
import { UserModule } from 'src/user/user.module';
import { TaskModule } from 'src/task/task.module';
import { DrawingboardModule } from 'src/drawingboard/drawingboard.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => InvitationsModule),
    TeamModule,
    TaskModule,
    DrawingboardModule,
    RoleModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
