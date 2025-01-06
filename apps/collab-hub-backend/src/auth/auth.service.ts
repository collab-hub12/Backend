import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { Response } from 'express';
import { compare } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { OTPService } from 'src/otp/otp.service';
import { InvitationsService } from 'src/invitations/invitations.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
    private readonly otpService: OTPService,
    private readonly invitationService: InvitationsService,
  ) {}

  async login(res: Response, user?: Express.User, invitation?: string) {
    if (!user) {
      throw new InternalServerErrorException('User not set in request');
    }
    if (invitation) {

      // accept inviation
      await this.invitationService.acceptInvitation(user.id, invitation);
    }
    const loginResponse = await this.authRefreshTokenService.generateTokenPair(
      user,
      res,
    );

    return loginResponse;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.isVerified) {
      return null;
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  async signup(signUpUserDTO: CreateUserDto, invitation?: string) {
    const user = await this.userService.findByEmail(signUpUserDTO.email);

    let inviteeId: string;

    if (user && user.isVerified) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    } else if (user && !user.isVerified) {
      // if user was not verified previously user details will be updated
      await this.userService.UpdateUser(signUpUserDTO);
      inviteeId = user.id;
    } else {
      const user = await this.userService.create(signUpUserDTO);
      inviteeId = user.id;
    }

    if (invitation) {
      await this.invitationService.acceptInvitation(inviteeId, invitation);
    }

    await this.otpService.requestOTP(signUpUserDTO.email, signUpUserDTO.name);
  }

  async requestOTP(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        'User with this email Id doesnt exists',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.otpService.requestOTP(email);
  }

  async verifyOTP(
    email: string,
    otp: string,
    res: Response,
    invitation: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        'User with this email Id doesnt exists',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.otpService.verifyOTP(email, otp);

    if (invitation) {
      await this.invitationService.acceptInvitation(user.id, invitation);
    }

    return this.authRefreshTokenService.generateTokenPair({ id: user.id }, res);
  }

  async resetPassword(password: string, userid: string) {
    await this.userService.UpdatePassword(userid, password);
  }
}
