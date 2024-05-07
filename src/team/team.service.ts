import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import type {schema} from 'src/drizzle/schemas/schema';
import {CreateTeamDto} from './dto/team.dto';
import {teamMember, teams} from 'src/drizzle/schemas/teams.schema';
import {and, eq} from 'drizzle-orm';

@Injectable()
export class TeamService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

    async createTeam(createTeamDto: CreateTeamDto) {
        return (await this.db.insert(teams).values({
            name: createTeamDto.team_name,
            org_id: createTeamDto.org_id
        }).returning())[0]
    }

    async findATeamUnderOrg(org_id: number, team_name: string) {
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

    async addMemberToTeam(team_id: number, user_id: number, org_id: number) {
        const rowsAffected = (await this.db.insert(teamMember).values({team_id, user_id, org_id, is_admin: false})).rowsAffected
        if (!rowsAffected) throw new ConflictException("issue occured adding member to the team")
        return {"msg": "member added to the team successFully"}
    }

    async removeMemberFromTeam(team_id: number, user_id: number, org_id: number) {
        const rowsAffected = (await this.db.delete(teamMember).where(
            and(
                eq(teamMember.team_id, team_id),
                eq(teamMember.user_id, user_id),
                eq(teamMember.org_id, org_id)
            )
        )).rowsAffected

        if (!rowsAffected) throw new ConflictException("issue occured removing member from the team")
        return {"msg": "member removed from the team successFully"}
    }

    async getUserinTeaminOrg(team_id: number, user_id: number, org_id: number) {
        const user = (await this.db.select().from(teamMember).where(
            and(
                eq(teamMember.team_id, team_id),
                eq(teamMember.user_id, user_id),
                eq(teamMember.org_id, org_id)
            )
        ))[0]
        if (!user) throw new ConflictException("user is not a part of Team inside Org")
        return user
    }

    async getUsersinTeamInOrg(team_id: number, org_id: number) {
        const result = await this.db.query.teamMember.findMany({
            where:
                and(
                    eq(teamMember.team_id, team_id),
                    eq(teamMember.org_id, org_id)
                ),
            with: {
                user: true
            }
        })
        const users = result.map(data => data.user)
        return users;
    }

    async makeUserAdminInsideTeam(user_id: number, team_id: number) {
        const rowsAffected = (await this.db.update(teamMember).set({is_admin: true}).where(
            and(
                eq(teamMember.user_id, user_id),
                eq(teamMember.team_id, team_id),
            )
        )).rowsAffected;
        if (!rowsAffected) throw new ConflictException("issue occured while making an user admin");
    }

}
