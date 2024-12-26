import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { Response } from 'express';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
  ) {}

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
}
