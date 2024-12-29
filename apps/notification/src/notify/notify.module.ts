import {Module} from '@nestjs/common';
import {NotifyService} from './notify.service';
import {MailModule} from 'src/mailer/mailer.module';

@Module({
  imports: [MailModule],
  providers: [NotifyService],
  exports: [NotifyService]
})
export class NotifyModule { }
