import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import type {schema} from 'src/drizzle/schemas/schema';
import {CreateTeamDto} from './dto/team.dto';
import {teamMember, teams} from 'src/drizzle/schemas/teams.schema';
import {organizations} from 'src/drizzle/schemas/organizations.schema';
import {and, eq, or} from 'drizzle-orm';

@Injectable()
export class TeamService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

    async createTeam(createTeamDto: CreateTeamDto) {
        return (await this.db.insert(teams).values({
            name: createTeamDto.team_name,
            org_id: createTeamDto.org_id
        }).returning())[0]
    }

    async FindATeamUnderOrg(org_id: number, team_name: string) {
        return (await this.db.select().from(teams).where(
            and(
                eq(teams.org_id, org_id),
                eq(teams.name, team_name)
            )
        ))[0]
    }

    async getAllTeamsUnderOrg(org_id: number) {
        return await this.db.select().from(teams).where(eq(teams.org_id, org_id))
    }

    async addMemberToTeam(team_id: number, user_id: number) {
        const rowsAffected = (await this.db.insert(teamMember).values({team_id, user_id})).rowsAffected
        if (!rowsAffected) throw new ConflictException("issue occured adding member to the team")
        return {"msg": "member added to the team successFully"}
    }


}
