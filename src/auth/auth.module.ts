import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwtauth.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { OrganizationService } from 'src/organization/organization.service';
import { TeamService } from 'src/team/team.service';
import { TaskService } from 'src/task/task.service';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';
import { InvitationsService } from 'src/invitations/invitations.service';
import { AuthController } from './auth.controller';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-token.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/access_token.guard';
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ConfigService,
    JwtStrategy,
    AuthService,
    AuthRefreshTokenService,
    ...drizzleProvider,
    LocalStrategy,
    JwtService,
    JwtRefreshStrategy,
    DrawingboardService,
    TeamService,
    UserService,
    TaskService,
    InvitationsService,
    OrganizationService,
  ],
})
export class AuthModule {}
