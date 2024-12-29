import {Injectable} from '@nestjs/common';
import {ProducerService} from 'src/queue/producer.service';


interface Notification {
    org_id?: number,
    user_id: number,
    task_id?: number,
    team_id?: number,
    description: string,
    notified_at: string,
    invitation_id?: number
}


@Injectable()
export class NotifyService {
    constructor(private readonly producer: ProducerService) { }

    async SendNotification(message: Notification) {
        await this.producer.PublishToQueue(message);
    }
}
