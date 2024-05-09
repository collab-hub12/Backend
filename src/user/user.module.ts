import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {JwtAuthStrategy} from 'src/auth/strategies/jwtauth.strategy';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';

@Module({
  providers: [ConfigService, UserService, ...drizzleProvider, JwtAuthStrategy, JwtService],
  controllers: [UserController]
})
export class UserModule { }
