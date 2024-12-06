import {Inject, Injectable} from '@nestjs/common';
import {and, eq} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {orgMembers} from 'src/drizzle/schemas/organizations.schema';
import {schema} from 'src/drizzle/schemas/schema';
import {teamMember} from 'src/drizzle/schemas/teams.schema';


@Injectable()
export class RoleService {
    constructor(
        @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    ) { }

    async isOrgAdmin(org_id: number, user_id: number) {
        const [result] = await this.db.select().from(orgMembers).where(
            and(
                eq(orgMembers.organizationId, org_id),
                eq(orgMembers.userId, user_id)
            )
        );
        if (!result) {
            return false;
        }
        return result.is_admin;
    }

    async isTeamAdmin(team_id: number, user_id: number) {
        const [result] = await this.db.select().from(teamMember).where(
            and(
                eq(teamMember.team_id, team_id),
                eq(teamMember.user_id, user_id)
            )
        );
        if (!result) {
            return false;
        }
        return result.is_admin;
    }
}
