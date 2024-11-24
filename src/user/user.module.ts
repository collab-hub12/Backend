import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {JwtStrategy} from 'src/auth/strategies/jwtauth.strategy';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {InvitationsService} from 'src/invitations/invitations.service';
import {OrganizationService} from 'src/organization/organization.service';
import {TeamService} from 'src/team/team.service';
import {TaskService} from 'src/task/task.service';
import {DrawingboardService} from 'src/drawingboard/drawingboard.service';

@Module({
  controllers: [UserController],
  providers: [
    ConfigService,
    UserService,
    ...drizzleProvider,
    JwtStrategy,
    JwtService,
    TeamService,
    TaskService,
    DrawingboardService,
    InvitationsService,
    OrganizationService,
  ],
})
export class UserModule { }
