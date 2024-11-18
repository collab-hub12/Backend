import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './strategies/jwtauth.strategy';
import { OrganizationService } from 'src/organization/organization.service';
import { TeamService } from 'src/team/team.service';
import { RoomService } from 'src/room/room.service';
import { TaskService } from 'src/task/task.service';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';
import { InvitationsService } from 'src/invitations/invitations.service';

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
    ConfigService,
    GoogleStrategy,
    JwtAuthStrategy,
    AuthService,
    ...drizzleProvider,
    JwtService,
    DrawingboardService,
    TeamService,
    RoomService,
    UserService,
    TaskService,
    InvitationsService,
    OrganizationService,
  ],
})
export class AuthModule {}
