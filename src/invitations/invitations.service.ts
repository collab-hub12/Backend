import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { invitations } from 'src/drizzle/schemas/invitations.schema';
import { organizations } from 'src/drizzle/schemas/organizations.schema';
import { schema } from 'src/drizzle/schemas/schema';
import { users } from 'src/drizzle/schemas/users.schema';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    @Inject(forwardRef(() => OrganizationService))
    private readonly orgService: OrganizationService,
  ) {}

  async invite(org_id: number, user_email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, user_email));
    if (!user) {
      throw new BadRequestException('user with this email does not exist');
    }
    const [invitaiton] = await this.db
      .insert(invitations)
      .values({
        invitation_from: org_id,
        user_id: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      })
      .returning();
    if (!invitaiton) {
      throw new BadRequestException('failed to sent invitaion');
    }
  }

  async getAllInvites(user_id: number) {
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

  async acceptInvitation(
    user_id: number,
    org_id: number,
    invitation_id: number,
  ) {
    try {
      // Fetch the invitation details
      const [invitation] = await this.db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.user_id, user_id),
            eq(invitations.invitation_from, org_id),
            eq(invitations.id, invitation_id),
          ),
        );

      // Check if the invitation is expired
      const currentTime = new Date().toISOString();

      if (invitation.expiresAt < currentTime) {
        throw new BadRequestException('Invitation has expired');
      }

      // Add the user to the organization
      await this.orgService.addMemberToOrg(org_id, user_id);

      // Expire the invitation
      await this.db
        .update(invitations)
        .set({ expiresAt: new Date().toISOString() })
        .where(eq(invitations.id, invitation_id));

      return { message: 'User accepted invitation successfully' };
    } catch (error) {
      throw new BadRequestException(
        'Invitation has expired or already been used',
      );
    }
  }
}
