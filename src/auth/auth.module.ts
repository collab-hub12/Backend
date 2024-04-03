import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({

  controllers: [AuthController],
  providers: [AuthService, ...drizzleProvider]
})
export class AuthModule { }
