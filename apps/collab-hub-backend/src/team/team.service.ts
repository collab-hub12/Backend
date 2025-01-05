import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import type {schema} from '@app/drizzle/schemas/schema';
import {CreateTeamDto} from './dto/team.dto';
import {teamMember, teams} from '@app/drizzle/schemas/teams.schema';
import {and, count, eq, getTableColumns, like, or, sql} from 'drizzle-orm';
import {users} from '@app/drizzle/schemas/users.schema';
import {organizations} from '@app/drizzle/schemas/organizations.schema';
import {assignedTasks} from '@app/drizzle/schemas/tasks.schema';

@Injectable()
export class TeamService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
  ) { }

  async createTeam(createTeamDto: CreateTeamDto) {
    return (
      await this.db
        .insert(teams)
        .values({
          name: createTeamDto.team_name,
          org_id: createTeamDto.org_id,
        })
        .returning()
    )[0];
  }

  async deleteTeam(team_id: string) {
    return await this.db.delete(teams).where(eq(teams.id, team_id));
  }

  // by team_id
  async findATeamUnderOrgById(org_id: string, team_id: string) {
    const team = (
      await this.db
        .select()
        .from(teams)
        .where(and(eq(teams.org_id, org_id), eq(teams.id, team_id)))
    )[0];
    if (!team) {
      throw new BadRequestException("team doesn't exists under org");
    }
    return team;
  }

  // by team_name
  async findATeamUnderOrgByName(org_id: string, team_name: string) {
    const team = (
      await this.db
        .select()
        .from(teams)
        .where(and(eq(teams.org_id, org_id), eq(teams.name, team_name)))
    )[0];

    return team;
  }

  async getAllTeamsThatUserIsPartOf(
    org_id: string,
    user_id: string,
    offset: number,
    limit: number,
  ) {
    try {
      const [total_team_count_response] = await this.db
        .select({count: count(teamMember.team_id)})
        .from(teamMember)
        .where(
          and(eq(teamMember.org_id, org_id), eq(teamMember.user_id, user_id)),
        );

      const result = await this.db
        .select({...getTableColumns(teams)})
        .from(teamMember)
        .innerJoin(teams, eq(teamMember.team_id, teams.id))
        .where(
          and(eq(teamMember.org_id, org_id), eq(teamMember.user_id, user_id)),
        )
        .offset(offset)
        .limit(limit);

      return {
        page: Math.floor(offset / limit) + 1,
        totalElements: total_team_count_response.count,
        totalPages: Math.ceil(total_team_count_response.count / limit),
        data: result,
      };
    } catch {
      throw new BadRequestException(
        'issue occured while fetching teams that user is part of',
      );
    }
  }

  async addMemberToTeam(
    team_id: string,
    user_id: string,
    org_id: string,
    is_admin?: boolean,
  ) {
    const rowsAffected = (
      await this.db
        .insert(teamMember)
        .values({team_id, user_id, org_id, is_admin: is_admin || false})
    ).rowCount;
    if (!rowsAffected)
      throw new ConflictException('issue occured adding member to the team');
    return {msg: 'member added to the team successFully'};
  }

  async removeMemberFromTeam(team_id: string, user_id: string, org_id: string) {
    const rowsAffected = (
      await this.db
        .delete(teamMember)
        .where(
          and(
            eq(teamMember.team_id, team_id),
            eq(teamMember.user_id, user_id),
            eq(teamMember.org_id, org_id),
          ),
        )
    ).rowCount;

    if (!rowsAffected)
      throw new ConflictException(
        'issue occured removing member from the team',
      );

    // remove all assigned tasks from user
    await this.db.delete(assignedTasks).where(
      eq(assignedTasks.user_id, user_id)
    )

    return {msg: 'member removed from the team successFully'};
  }

  async getUserinTeaminOrg(team_id: string, user_id: string, org_id: string) {
    // check if team exists
    await this.findATeamUnderOrgById(org_id, team_id);

    const user = (
      await this.db
        .select()
        .from(teamMember)
        .where(
          and(
            eq(teamMember.team_id, team_id),
            eq(teamMember.user_id, user_id),
            eq(teamMember.org_id, org_id),
          ),
        )
    )[0];

    if (!user)
      throw new ForbiddenException('user is not a part of Team inside Org');
    return user;
  }

  async getTeamDetails(team_id: string, user_id: string, org_id: string) {
    // check if team exists
    await this.findATeamUnderOrgById(org_id, team_id);

    const team = (
      await this.db
        .select({...getTableColumns(teams)})
        .from(teamMember)
        .innerJoin(teams, eq(teams.id, teamMember.team_id))
        .where(
          and(
            eq(teamMember.team_id, team_id),
            eq(teamMember.user_id, user_id),
            eq(teamMember.org_id, org_id),
          ),
        )
    )[0];

    if (!team)
      throw new ForbiddenException('user is not a part of Team inside Org');
    return team;
  }

  async getUsersinTeamInOrg(
    team_id: string,
    org_id: string,
    search_text: string,
    offset: number,
    limit: number,
  ) {
    search_text = search_text?.toLowerCase();

    const data = await this.db
      .select({
        id: users.id,
        isAdmin: teamMember.is_admin,
        name: users.name,
        email: users.email,
        picture: users.picture,
      })
      .from(teamMember)
      .innerJoin(users, eq(teamMember.user_id, users.id))
      .innerJoin(organizations, eq(teamMember.org_id, organizations.id))
      .innerJoin(teams, eq(teamMember.team_id, teams.id))
      .where(
        and(
          eq(organizations.id, org_id),
          eq(teams.id, team_id),
          or(
            sql`${search_text === undefined}`,
            or(
              like(users.email, `%${search_text}%`),
              like(users.name, `%${search_text}%`),
            ),
          ),
        ),
      )
      .offset(offset)
      .limit(limit);

    return data;
  }

  async makeUserAdminInsideTeam(user_id: string, team_id: string) {
    const rowsAffected = (
      await this.db
        .update(teamMember)
        .set({is_admin: true})
        .where(
          and(eq(teamMember.user_id, user_id), eq(teamMember.team_id, team_id)),
        )
    ).rowCount;
    if (!rowsAffected)
      throw new ConflictException('issue occured while making an user admin');
  }

  async revokeAdminRoleInTeam(user_id: string, team_id: string) {
    const rowsAffected = (
      await this.db
        .update(teamMember)
        .set({is_admin: false})
        .where(
          and(eq(teamMember.user_id, user_id), eq(teamMember.team_id, team_id)),
        )
    ).rowCount;
    if (!rowsAffected)
      throw new ConflictException('issue occured while making an user admin');
  }
}
