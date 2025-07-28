import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { MailModule } from '@app/mailer/mailer.module';

@Module({
  imports: [MailModule],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
