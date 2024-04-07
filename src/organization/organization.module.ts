import {Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';
import {TeamService} from 'src/team/team.service';
import {TaskService} from 'src/task/task.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, UserService, TeamService, TaskService, ...drizzleProvider]
})
export class OrganizationModule { }
