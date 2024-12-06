import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {and, eq} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {invitations} from 'src/drizzle/schemas/invitations.schema';
import {organizations} from 'src/drizzle/schemas/organizations.schema';
import {schema} from 'src/drizzle/schemas/schema';
import {OrganizationService} from 'src/organization/organization.service';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    private readonly orgService: OrganizationService,
  ) { }

  async invite(org_id: number, user_id: number) {
    const [invitaiton] = (
      await this.db
        .insert(invitations)
        .values({
          invitation_from: org_id,
          user_id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        })
        .returning()
    );
    if (!invitaiton) {
      throw new BadRequestException('failed to sent invitaion');
    }
  }

  async getAllInvites(user_id: number) {
    return await this.db
      .select({org_name: organizations.org_name, org_id: organizations.id})
      .from(invitations)
      .innerJoin(
        organizations,
        eq(organizations.id, invitations.invitation_from),
      )
      .where(eq(invitations.user_id, user_id));
  }

  async remove(org_id: number, user_id: number) {
    return await this.db
      .delete(invitations)
      .where(
        and(
          eq(invitations.invitation_from, org_id),
          eq(invitations.user_id, user_id),
        ),
      );
  }

  async acceptInvitation(user_id: number, org_id: number, invitation_id: number) {

    await this.orgService.addMemberToOrg(org_id, {user_id});

    await this.db
      .delete(invitations)
      .where(and(eq(invitations.user_id, user_id), eq(invitations.invitation_from, org_id)));

  }
}
