import { Injectable } from '@nestjs/common';
import { ProducerService } from 'src/queue/producer.service';

interface Notification {
  org_id?: string;
  user_email?: string;
  task_id?: string;
  team_id?: string;
  description: string;
  notified_at: string;
  invitation_id?: string;
  user_id?: string;
}

@Injectable()
export class NotifyService {
  constructor(private readonly producer: ProducerService) {}

  async SendNotification(message: Notification) {
    await this.producer.PublishToQueue(message);
  }
}
