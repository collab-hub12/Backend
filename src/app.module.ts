import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from './drizzle/drizzle.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [DrizzleModule, AuthModule, ConfigModule.forRoot(), UserModule, OrganizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
