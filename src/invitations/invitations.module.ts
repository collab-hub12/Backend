import { Module, forwardRef } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [forwardRef(() => OrganizationModule)],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
