import {schema} from '@app/drizzle/schemas/schema';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {notifications} from '@app/drizzle/schemas/notification.schema';
import {invitations} from '@app/drizzle/schemas/invitations.schema';
import {users} from '@app/drizzle/schemas/users.schema';
import {and, eq} from 'drizzle-orm';
import {organizations} from '@app/drizzle/schemas/organizations.schema';
import {MailService} from '@app/mailer/mailer.service';


interface Notification {
    org_id?: string,
    user_email: string,
    task_id?: string,
    team_id?: string,
    description: string,
    notified_at: string,
    invitation_id?: string,
    user_id: string,
}


@Injectable()
export class NotifyService {

    constructor(
        @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
        private readonly mailservice: MailService
    ) { }

    async notify(message: Notification) {
        try {
            const [notification] = await this.db.insert(notifications).values(message).returning()

            if (!message.invitation_id) {
                await this.mailservice.sendNotification(message)
                return;
            }

            const [invitation] = await this.db.select().from(invitations)
                .innerJoin(users, eq(invitations.user_id, users.id))
                .innerJoin(organizations, eq(organizations.id, invitations.invitation_from))
                .where(and(
                    eq(invitations.id, message.invitation_id),
                    eq(invitations.invitation_from, message.org_id),
                    eq(invitations.user_id, message.user_id)
                ))

            await this.mailservice.sendInvitation(invitation.users.email, invitation.users.name, "", invitation.organizations.org_name);
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException(err)
        }
    }
}
