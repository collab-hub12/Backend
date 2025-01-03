import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {drizzleProvider} from '@app/drizzle/drizzle.provider';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {JwtStrategy} from './strategies/jwtauth.strategy';
import {LocalStrategy} from './strategies/local.strategy';
import {AuthController} from './auth.controller';
import {AuthRefreshTokenService} from './auth-refresh-token.service';
import {JwtRefreshStrategy} from './strategies/jwt-refresh-token.strategy';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './guards/access_token.guard';
import {UserModule} from 'src/user/user.module';
import {OTPModule} from 'src/otp/otp.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    OTPModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
    AuthService,
    AuthRefreshTokenService,
    LocalStrategy,
    JwtService,
    JwtRefreshStrategy,
  ],
})
export class AuthModule { }
