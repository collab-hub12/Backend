import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { NotifyModule } from 'src/notify/notify.module';

@Module({
  imports: [NotifyModule],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class QueueModule {}
