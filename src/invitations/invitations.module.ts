import {Module} from '@nestjs/common';
import {InvitationsService} from './invitations.service';
import {InvitationsController} from './invitations.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {OrganizationModule} from 'src/organization/organization.module';


@Module({
  imports: [OrganizationModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, ...drizzleProvider],
})
export class InvitationsModule { }
