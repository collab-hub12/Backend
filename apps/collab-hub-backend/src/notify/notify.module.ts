import { Global, Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { QueueModule } from 'src/queue/queue.module';

@Global()
@Module({
  imports: [QueueModule],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
