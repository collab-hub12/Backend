import {Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, UserService, ...drizzleProvider]
})
export class OrganizationModule { }
