import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {and, eq, getTableColumns} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';

import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {invitations} from '@app/drizzle/schemas/invitations.schema';
import {organizations} from '@app/drizzle/schemas/organizations.schema';
import {schema} from '@app/drizzle/schemas/schema';
import {users} from '@app/drizzle/schemas/users.schema';
import {OrganizationService} from "../organization/organization.service";
import {ConfigService} from '@nestjs/config';
import {NotifyService} from 'src/notify/notify.service'

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    @Inject(forwardRef(() => OrganizationService))
    private readonly orgService: OrganizationService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotifyService
  ) { }

  async invite(org_id: string, user_email: string) {
    const org_details = await this.orgService.findOrgById(org_id);

    const [invitaiton] = await this.db
      .insert(invitations)
      .values({
        invitation_from: org_id,
        sent_to: user_email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      })
      .returning();

    if (!invitaiton) {
      throw new BadRequestException('failed to create invitaion');
    }

    await this.notificationService.SendNotification({
      invitation_id: invitaiton.id,
      description: `invitation_link:${this.configService.get('FRONTEND_URL')}/invitations/${invitaiton.id}/accept,org_name:${org_details.org_name}`,
      notified_at: new Date(Date.now()).toISOString(),
      user_email,
      org_id: org_id
    })

  }

  async getAllInvites(user_id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, user_id));

    return await this.db
      .select({
        ...getTableColumns(invitations),
        invitation_from: organizations.org_name,
        org_id: organizations.id,
      })
      .from(invitations)
      .innerJoin(
        organizations,
        eq(organizations.id, invitations.invitation_from),
      )
      .where(eq(invitations.sent_to, user.email));
  }

  async remove(org_id: string, email_id: string) {
    return await this.db
      .delete(invitations)
      .where(
        and(
          eq(invitations.invitation_from, org_id),
          eq(invitations.sent_to, email_id),
        ),
      );
  }

  async acceptInvitation(
    user_id: string,
    invitation_id: string,
  ) {

    // Fetch the invitation details
    const [invitation_response] = await this.db
      .select()
      .from(invitations)
      .innerJoin(users, eq(users.email, invitations.sent_to))
      .where(
        and(
          eq(invitations.sent_to, users.email),
          eq(invitations.id, invitation_id),
        ),
      );

    // Check if the invitation is expired
    const currentTime = new Date().toISOString();

    if (invitation_response.invitations.expiresAt < currentTime) {

      throw new BadRequestException('Invitation has expired or already used');
    }

    // Add the user to the organization
    await this.orgService.addMemberToOrg(invitation_response.invitations.invitation_from, user_id);

    // Expire the invitation
    await this.db
      .update(invitations)
      .set({expiresAt: new Date().toISOString()})
      .where(eq(invitations.id, invitation_id));

    return {message: 'User accepted invitation successfully'};

  }
}
