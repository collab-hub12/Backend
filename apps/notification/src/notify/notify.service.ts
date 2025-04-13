import {schema} from '@app/drizzle/schemas/schema';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {notifications} from '@app/drizzle/schemas/notification.schema';
import {users} from '@app/drizzle/schemas/users.schema';
import {and, eq, or} from 'drizzle-orm';
import {MailService} from '@app/mailer/mailer.service';
import {use} from 'passport';


interface Notification {
    org_id?: string,
    user_email?: string,
    task_id?: string,
    team_id?: string,
    description: string,
    notified_at: string,
    invitation_id?: string,
    user_id?: string,
}


@Injectable()
export class NotifyService {

    constructor(
        @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
        private readonly mailservice: MailService
    ) { }

    async notify(message: Notification) {
        try {

            const queryFilter = message.user_id ? eq(users.id, message.user_id) : eq(users.email, message.user_email)

            const [user] = await this.db.select().from(users).where(queryFilter)

            if (message.invitation_id) {
                const split_msg = message.description.split(",")
                const description = split_msg[0].split(":")[1] + ":" + split_msg[0].split(":")[2]
                const org_name = split_msg[1].split(":")[1]

                await this.mailservice.sendInvitation(message.user_email, description, org_name);
                return;
            } else {

                await this.db.insert(notifications).values({
                    sent_to: user.email,
                    task_id: message.task_id,
                    org_id: message.org_id,
                    team_id: message.team_id,
                    notified_at: message.notified_at,
                    description: message.description
                })
                await this.mailservice.sendNotification(user.email, user.name, message.description);
            }

        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException(err)
        }
    }
}
