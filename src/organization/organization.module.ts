import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';
import { UserService } from 'src/user/user.service';
import { TeamService } from 'src/team/team.service';
import { TaskService } from 'src/task/task.service';
import { JwtStrategy } from 'src/auth/strategies/jwtauth.strategy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';
import { InvitationsService } from 'src/invitations/invitations.service';
import { JwtAuthGuard } from 'src/auth/guards/access_token.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoleService } from 'src/role/role.service';

@Module({
  controllers: [OrganizationController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ConfigService,
    JwtStrategy,
    UserService,
    ...drizzleProvider,
    JwtService,
    OrganizationService,
    TeamService,
    TaskService,
    DrawingboardService,
    RoleService,
    InvitationsService,
  ],
  exports: [OrganizationService],
})
export class OrganizationModule {}
