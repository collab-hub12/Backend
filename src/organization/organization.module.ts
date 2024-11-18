import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';
import { UserService } from 'src/user/user.service';
import { TeamService } from 'src/team/team.service';
import { TaskService } from 'src/task/task.service';
import { JwtAuthStrategy } from 'src/auth/strategies/jwtauth.strategy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';
import { InvitationsService } from 'src/invitations/invitations.service';

@Module({
  controllers: [OrganizationController],
  providers: [
    ConfigService,
    JwtAuthStrategy,
    UserService,
    ...drizzleProvider,
    JwtService,
    OrganizationService,
    TeamService,
    TaskService,
    DrawingboardService,
    InvitationsService,
  ],
})
export class OrganizationModule {}
