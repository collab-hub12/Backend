import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { QueueModule } from 'src/queue/queue.module';
import { ConfigModule } from '@nestjs/config';
import { NotifyModule } from './notify/notify.module';
import { DrizzleModule } from '@app/drizzle/drizzle.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NotifyModule,
    QueueModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
