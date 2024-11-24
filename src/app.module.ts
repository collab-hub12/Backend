import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from './drizzle/drizzle.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import {UserModule} from './user/user.module';
import {TaskModule} from './task/task.module';
import {TeamModule} from './team/team.module';
import {RoomModule} from './room/room.module';
import {SocketModule} from './socket/socket.module';
import {DrawingboardModule} from './drawingboard/drawingboard.module';
import {InvitationsModule} from './invitations/invitations.module';
import {QueueModule} from './queue/queue.module';
import {OrganizationModule} from './organization/organization.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzleModule,
    AuthModule,
    UserModule,
    TaskModule,
    TeamModule,
    RoomModule,
    SocketModule,
    DrawingboardModule,
    InvitationsModule,
    QueueModule,
    OrganizationModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
