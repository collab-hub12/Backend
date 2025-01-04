import {HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';

import {UserService} from 'src/user/user.service';
import {AuthRefreshTokenService} from './auth-refresh-token.service';
import {Response} from 'express';
import {compare} from 'bcrypt';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {OTPService} from 'src/otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
    private readonly otpService: OTPService
  ) { }

  async login(res: Response, user?: Express.User) {
    if (!user) {
      throw new InternalServerErrorException('User not set in request');
    }
    return this.authRefreshTokenService.generateTokenPair(user, res);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  async signup(signUpUserDTO: CreateUserDto) {
    const user = await this.userService.findByEmail(signUpUserDTO.email);

    if (user) {

      if (user.isVerified) {
        throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
      }
      // if user was not verified previously user details will be updated
      await this.userService.UpdateUser(signUpUserDTO)
    } else {
      await this.userService.create(signUpUserDTO)
    }

    await this.otpService.requestOTP(signUpUserDTO.email, signUpUserDTO.name);
  }

  async requestOTP(email: string) {
    await this.otpService.requestOTP(email)
  }

  async verifyOTP(email: string, otp: string, res: Response) {
    await this.otpService.verifyOTP(email, otp)
    const user = await this.userService.findByEmail(email)
    return this.authRefreshTokenService.generateTokenPair({id: user.id}, res)
  }
}
