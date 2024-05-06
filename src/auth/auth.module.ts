import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';
import {JwtService} from '@nestjs/jwt';
import {GoogleStrategy} from './strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, AuthService, UserService, ...drizzleProvider, JwtService]
})
export class AuthModule { }
