import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
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
} from 'src/common/constants/cookies';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {Public} from 'src/common/decorator/public.decorator';
import {User} from 'src/common/decorator/user.decorator';
import {RefreshTokenGuard} from './guards/refresh_token.guard';
import {OTPService} from 'src/otp/otp.service';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {verifyOTPDTO} from './dto/otp.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authenticationService: AuthService,
    private authRefreshTokenService: AuthRefreshTokenService,
    private otpService: OTPService
  ) { }

  @ApiBody({type: LoginUserDto})
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authenticationService.login(res, req.user);
  }

  @ApiBearerAuth()
  @Get('profile')
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
  @Post('logout')
  clearAuthCookie(@Res({passthrough: true}) res: Response) {
    res.clearCookie(cookieConfig.refreshToken.name);
  }

  @Public()
  @Post("/signup")
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto)
    await this.otpService.requestOTP(dto.email);
  }

  @Public()
  @Get("/otp/resend")
  async resendOTP(@Query('email') email: string) {
    await this.otpService.requestOTP(email)
  }

  @Public()
  @Post("/otp/verify")
  @HttpCode(HttpStatus.ACCEPTED)
  async verify(@Body() dto: verifyOTPDTO) {
    await this.otpService.verifyOTP(dto.email, dto.otp)
  }
}
