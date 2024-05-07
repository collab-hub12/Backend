import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';
import {UserService} from 'src/user/user.service';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {GoogleStrategy} from './strategies/google.strategy';
import {ConfigService} from '@nestjs/config';
import {JwtAuthStrategy} from './strategies/jwtauth.strategy';

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
      }
    })
  ],
  controllers: [AuthController],
  providers: [ConfigService, GoogleStrategy, JwtAuthStrategy, AuthService, UserService, ...drizzleProvider, JwtService]
})
export class AuthModule { }
