import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {UserService} from 'src/user/user.service';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {AuthRefreshTokenService} from './auth-refresh-token.service';
import {LoginUserDto} from './dto/auth.dto';
import {Response, Request} from 'express';
import {
  cookieConfig,
  extractRefreshTokenFromCookies,
} from 'src/constants/cookies';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {Public} from 'src/decorator/public.decorator';
import {User} from 'src/decorator/user.decorator';
import {RefreshTokenGuard} from './guards/refresh_token.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authenticationService: AuthService,
    private authRefreshTokenService: AuthRefreshTokenService,
  ) { }

  @ApiBody({type: LoginUserDto})
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authenticationService.login(res, req.user);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseInterceptors(ClassSerializerInterceptor)
  async me(
    @User() authUser: Express.User,
    @Res({passthrough: true}) res: Response,
  ) {
    res.header('Cache-Control', 'no-store');
    return this.userService.findOne(authUser.id);
  }

  @ApiBearerAuth()
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  refreshTokens(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response,
  ) {
    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return this.authRefreshTokenService.generateTokenPair(
      (req.user as any).attributes,
      res,
      extractRefreshTokenFromCookies(req) as string,
      (req.user as any).refreshTokenExpiresAt,
    );
  }

  @Public()
  @Post('clear-auth-cookie')
  clearAuthCookie(@Res({passthrough: true}) res: Response) {
    res.clearCookie(cookieConfig.refreshToken.name);
  }
}
