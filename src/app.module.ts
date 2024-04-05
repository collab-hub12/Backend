import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from './drizzle/drizzle.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { TaskModule } from './task/task.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [DrizzleModule, AuthModule, ConfigModule.forRoot(), UserModule, OrganizationModule, TaskModule, TeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
