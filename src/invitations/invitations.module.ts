import {Module} from '@nestjs/common';
import {InvitationsService} from './invitations.service';
import {InvitationsController} from './invitations.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, ...drizzleProvider],
})
export class InvitationsModule { }
