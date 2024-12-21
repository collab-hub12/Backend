import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [
    forwardRef(() => InvitationsModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
