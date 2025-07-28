import { Module } from '@nestjs/common';
import { OTPService } from './otp.service';
import { RedisModule } from '@app/redis/redis.module';
import { MailModule } from '@app/mailer/mailer.module';

@Module({
  imports: [MailModule, RedisModule.forRootAsync()],
  providers: [OTPService],
  exports: [OTPService],
})
export class OTPModule {}
