
import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {and, eq} from 'drizzle-orm';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {invitations} from 'src/drizzle/schemas/invitations.schema';
import {organizations} from 'src/drizzle/schemas/organizations.schema';
import {schema} from 'src/drizzle/schemas/schema';

@Injectable()
export class InvitationsService {
    constructor(
        @Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>
    ) {
    }

    async invite(org_id: number, user_id: number) {
        const invitaiton = (await this.db.insert(invitations).values({
            invitation_from: org_id,
            user_id
        }).returning())[0]
        if (!invitaiton) {
            throw new BadRequestException("failed to sent invitaion")
        }
    }

    async getAllInvites(user_id: number) {
        return await this.db.select({org_name: organizations.org_name, org_id: organizations.id}).from(invitations).innerJoin(
            organizations, eq(organizations.id, invitations.invitation_from)).where(eq(invitations.user_id, user_id))
    }

    async remove(org_id: number, user_id: number) {
        return await this.db.delete(invitations).where(and(eq(invitations.invitation_from, org_id), eq(invitations.user_id, user_id)))
    }

}
