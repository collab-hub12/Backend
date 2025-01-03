import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from '@app/drizzle/drizzle.module';
import {ConfigModule} from '@nestjs/config';
import {SocketModule} from './socket/socket.module';
import {QueueModule} from './queue/queue.module';
import {OrganizationModule} from './organization/organization.module';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {TeamModule} from './team/team.module';
import {TaskModule} from './task/task.module';
import {NotifyModule} from './notify/notify.module';
import {OTPModule} from './otp/otp.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OTPModule,
    NotifyModule,
    SocketModule,
    QueueModule,
    TeamModule,
    TaskModule,
    DrizzleModule,
    UserModule,
    OrganizationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
