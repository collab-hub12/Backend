import {schema} from '@app/drizzle/schemas/schema';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {notifications} from '@app/drizzle/schemas/notification.schema';
import {invitations} from '@app/drizzle/schemas/invitations.schema';
import {users} from '@app/drizzle/schemas/users.schema';
import {and, eq} from 'drizzle-orm';
import {organizations} from '@app/drizzle/schemas/organizations.schema';
import {MailService} from 'src/mailer/mailer.service';


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

    constructor(
        @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
        private readonly mailservice: MailService
    ) { }

    async notify(message: Notification) {
        try {
            const [notification] = await this.db.insert(notifications).values(message).returning()

            if (!message.invitation_id) return;

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
