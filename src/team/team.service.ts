import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import type { schema } from 'src/drizzle/schemas/schema';
import { CreateTeamDto } from './dto/team.dto';
import { teamMember, teams } from 'src/drizzle/schemas/teams.schema';
import { and, eq, like, or, sql } from 'drizzle-orm';
import { users } from 'src/drizzle/schemas/users.schema';
import { organizations } from 'src/drizzle/schemas/organizations.schema';

@Injectable()
export class TeamService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
  ) {}

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

  // by team_id
  async findATeamUnderOrgById(org_id: number, team_id: number) {
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
  async findATeamUnderOrgByName(org_id: number, team_name: string) {
    const team = (
      await this.db
        .select()
        .from(teams)
        .where(and(eq(teams.org_id, org_id), eq(teams.name, team_name)))
    )[0];

    return team;
  }

  async getAllTeamsThatUserIsPartOf(org_id: number, user_id: number) {
    const result = await this.db.query.teamMember.findMany({
      where: and(
        eq(teamMember.org_id, org_id),
        eq(teamMember.user_id, user_id),
      ),
      with: {
        team: true,
      },
    });
    return result.map((data) => data.team);
  }

  async addMemberToTeam(
    team_id: number,
    user_id: number,
    org_id: number,
    is_admin?: boolean,
  ) {
    const rowsAffected = (
      await this.db
        .insert(teamMember)
        .values({ team_id, user_id, org_id, is_admin: is_admin || false })
    ).rowsAffected;
    if (!rowsAffected)
      throw new ConflictException('issue occured adding member to the team');
    return { msg: 'member added to the team successFully' };
  }

  async removeMemberFromTeam(team_id: number, user_id: number, org_id: number) {
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
    ).rowsAffected;

    if (!rowsAffected)
      throw new ConflictException(
        'issue occured removing member from the team',
      );
    return { msg: 'member removed from the team successFully' };
  }

  async getUserinTeaminOrg(team_id: number, user_id: number, org_id: number) {
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

  async getUsersinTeamInOrg(
    team_id: number,
    org_id: number,
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
      .limit(limit)
      .all();
    return data;
  }

  async makeUserAdminInsideTeam(user_id: number, team_id: number) {
    const rowsAffected = (
      await this.db
        .update(teamMember)
        .set({ is_admin: true })
        .where(
          and(eq(teamMember.user_id, user_id), eq(teamMember.team_id, team_id)),
        )
    ).rowsAffected;
    if (!rowsAffected)
      throw new ConflictException('issue occured while making an user admin');
  }
}
