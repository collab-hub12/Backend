import {Controller, Get, HttpCode} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiOperation} from '@nestjs/swagger';
import {Public} from './decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({summary: 'Get health status'})
  @Get('/health')
  @Public()
  @HttpCode(200)
  GetHealthStatus() {
    return this.appService.getHello();
  }
}
