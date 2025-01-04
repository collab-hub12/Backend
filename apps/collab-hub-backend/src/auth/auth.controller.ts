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
  Put,
} from '@nestjs/common';
import {UserService} from 'src/user/user.service';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {AuthRefreshTokenService} from './auth-refresh-token.service';
import {LoginUserDto, resetPasswordDTO} from './dto/auth.dto';
import {Response, Request} from 'express';
import {
  cookieConfig,
  extractRefreshTokenFromCookies,
} from 'src/common/constants/cookies';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {Public} from 'src/common/decorator/public.decorator';
import {User} from 'src/common/decorator/user.decorator';
import {RefreshTokenGuard} from './guards/refresh_token.guard';
import {CreateUserDto} from 'src/user/dto/user.dto';
import {verifyOTPDTO} from './dto/otp.dto';


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
  async signup(@Body() signupDTO: CreateUserDto) {
    await this.authenticationService.signup(signupDTO)
  }

  @Public()
  @Get("/otp/resend")
  async resendOTP(@Query('email') email: string) {
    await this.authenticationService.requestOTP(email)
  }

  @Public()
  @Post("/otp/verify")
  async verify(@Body() dto: verifyOTPDTO, @Res({passthrough: true}) res: Response) {
    return await this.authenticationService.verifyOTP(dto.email, dto.otp, res)
  }

  @ApiBearerAuth()
  @Put("/password/reset")
  async resetpassword(
    @Body() resetPasswordDTO: resetPasswordDTO,
    @User() authUser: Express.User,
  ) {
    return await this.authenticationService.resetPassword(resetPasswordDTO.password, authUser.id);
  }

}
