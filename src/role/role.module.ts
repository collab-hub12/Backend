import {Module} from '@nestjs/common';
import {RoleService} from './role.service';
import {RoleController} from './role.controller';
import {OrganizationService} from 'src/organization/organization.service';
import {TeamService} from 'src/team/team.service';
import {RoomService} from 'src/room/room.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';
import {TaskService} from 'src/task/task.service';
import {JwtService} from '@nestjs/jwt';

@Module({
  controllers: [RoleController],
  providers: [JwtService, RoleService, OrganizationService, TeamService, RoomService, ...drizzleProvider, UserService, TaskService],
})
export class RoleModule { }
