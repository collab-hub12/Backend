import {Module} from '@nestjs/common';
import {OrganizationController} from './organization.controller';
import {OrganizationService} from './organization.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';
import {TeamService} from 'src/team/team.service';
import {TaskService} from 'src/task/task.service';
import {JwtAuthStrategy} from 'src/auth/strategies/jwtauth.strategy';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';

@Module({
  controllers: [OrganizationController],
  providers: [ConfigService, JwtAuthStrategy, UserService, ...drizzleProvider, JwtService,
    OrganizationService, UserService, TeamService, TaskService]
})
export class OrganizationModule { }
