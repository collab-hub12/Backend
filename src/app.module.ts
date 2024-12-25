import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from './drizzle/drizzle.module';
import {ConfigModule} from '@nestjs/config';
import {SocketModule} from './socket/socket.module';
import {QueueModule} from './queue/queue.module';
import {OrganizationModule} from './organization/organization.module';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {TeamModule} from './team/team.module';
import {MailModule} from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    SocketModule,
    QueueModule,
    AuthModule,
    UserModule,
    TeamModule,
    OrganizationModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
