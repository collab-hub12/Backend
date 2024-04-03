import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DrizzleModule} from './drizzle/drizzle.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [DrizzleModule, AuthModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
