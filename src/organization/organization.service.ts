import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {AddUserToOrgDto, CreateOrgDto} from './dto/organization.dto';
import {UserService} from 'src/user/user.service';
import {
  orgMembers,
  organizations,
} from 'src/drizzle/schemas/organizations.schema';
import {and, count, eq, getTableColumns, like, or, sql} from 'drizzle-orm';
import type {schema} from 'src/drizzle/schemas/schema';
import {TeamService} from 'src/team/team.service';
import {CreateTeamDto} from 'src/team/dto/team.dto';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';
import {TaskService} from 'src/task/task.service';
import {users} from 'src/drizzle/schemas/users.schema';
import {UpdateTaskDto} from 'src/task/dto/update-task.dto';
import {DrawingboardService} from 'src/drawingboard/drawingboard.service';
import {InvitationsService} from 'src/invitations/invitations.service';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly taskService: TaskService,
    private readonly drawingBoardService: DrawingboardService,
    private readonly inviationService: InvitationsService,
  ) { }

  async createOrganization(dto: CreateOrgDto, founder_id: number) {
    const founder = await this.userService.findById(founder_id);
    if (!founder) {
      throw new ConflictException('user not found');
    }

    const result = await this.db
      .insert(organizations)
      .values({...dto, founder_id})
      .returning();

    const org_id = result[0].id;
    await this.db
      .insert(orgMembers)
      .values({userId: founder_id, organizationId: org_id, is_admin: true});
    return result[0];
  }

  async findOrgById(org_id: number) {
    const org_detail = (
      await this.db
        .select()
        .from(organizations)
        .where(eq(organizations.id, org_id))
    )[0];

    if (!org_detail) throw new NotFoundException('org not found');
    return org_detail;
  }

  async findOrgs(search_text: string, offset: number, limit: number) {
    const org_details = await this.db
      .select()
      .from(organizations)
      .where(like(organizations.org_name, `%${search_text}%`))
      .limit(limit)
      .offset(offset);
    return org_details;
  }

  async findOrgsThatUserIsPartOf(
    user_id: number,
    limit: number,
    offset: number,
  ) {
    console.log(offset, limit);

    // Fetch total count of organizations related to the user
    const TotalOrgCountResponse = this.db
      .select({count: count(orgMembers.organizationId)})
      .from(orgMembers)
      .where(eq(orgMembers.userId, user_id));

    // Fetch paginated organizations
    const paginatedOrgs = this.db
      .select({...getTableColumns(organizations)})
      .from(organizations)
      .innerJoin(orgMembers, eq(organizations.id, orgMembers.organizationId))
      .where(eq(orgMembers.userId, user_id))
      .limit(limit)
      .offset(offset);

    const [[resultTotalOrgCount], paginatedOrgsResponse] = await Promise.all([
      TotalOrgCountResponse,
      paginatedOrgs,
    ]);

    return {
      page: Math.floor(offset / limit) + 1,
      totalElements: resultTotalOrgCount.count,
      totalPages: Math.ceil(resultTotalOrgCount.count / limit),
      data: paginatedOrgsResponse,
    };
  }

  async getMemberInOrg(org_id: number, user_id: number) {
    const result = (
      await this.db
        .select()
        .from(orgMembers)
        .where(
          and(
            eq(orgMembers.organizationId, org_id),
            eq(orgMembers.userId, user_id),
          ),
        )
    )[0];
    return result;
  }

  async makeUserAdminInsideOrg(user_id: number, org_id: number) {
    const rowsAffected = (
      await this.db
        .update(orgMembers)
        .set({is_admin: true})
        .where(
          and(
            eq(orgMembers.userId, user_id),
            eq(orgMembers.organizationId, org_id),
          ),
        )
    ).rowsAffected;
    if (!rowsAffected)
      throw new ConflictException('issue occured while making an user admin');
  }

  async SendInvitation(org_id: number, dto: AddUserToOrgDto) {
    await this.userService.findById(dto.user_id);
    const result = await this.findOrgById(org_id);
    if (!result) {
      throw new ConflictException('org doesnt exists');
    }

    //checking if user already exists or not
    const isAlreadyInOrg = await this.getMemberInOrg(org_id, dto.user_id);

    if (isAlreadyInOrg) {
      throw new ConflictException('user is already added in Org');
    }

    // send invitaion to user
    return await this.inviationService.invite(org_id, dto.user_id);
  }

  async addMemberToOrg(org_id: number, dto: AddUserToOrgDto) {
    return await this.db
      .insert(orgMembers)
      .values({userId: dto.user_id, organizationId: org_id, is_admin: false});
  }

  async getMembers(
    org_id: number,
    search_text: string,
    offset: number,
    limit: number,
  ) {
    const {password, ...columns} = getTableColumns(users)

    const query = this.db
      .select(columns)
      .from(orgMembers)
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .offset(offset)
      .limit(limit)

    search_text = search_text?.toLowerCase();

    if (search_text) {
      query.where(
        and(
          eq(orgMembers.organizationId, org_id),
          or(
            like(users.email, `%${search_text}%`),
            like(users.name, `%${search_text}%`),
          ),
        ),
      );
    } else {
      query.where(eq(orgMembers.organizationId, org_id));
    }

    const totalUserCount = this.db
      .select({count: count(users.id)})
      .from(users)
      .where(eq(orgMembers.organizationId, org_id));

    const [[resultTotalUserCount], result] = await Promise.all([
      totalUserCount,
      query,
    ]);

    return {
      page: Math.floor(offset / limit) + 1,
      totalElements: resultTotalUserCount.count,
      totalPages: Math.ceil(resultTotalUserCount.count / limit),
      data: result,
    };
  }

  async CheckFounderorNot(org_id: number, user_id: number): Promise<boolean> {
    const IsFounder = (
      await this.db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.founder_id, user_id),
            eq(organizations.id, org_id),
          ),
        )
    )[0];
    return Boolean(IsFounder);
  }

  async removeMember(org_id: number, user_id: number) {
    const orgExists = await this.findOrgById(org_id);
    if (!orgExists) {
      throw new ConflictException('org doesnt exists');
    }

    const IsFounder = await this.CheckFounderorNot(org_id, user_id);

    if (IsFounder) {
      throw new ConflictException('Founder cannot be removed');
    }

    const result = await this.db
      .delete(orgMembers)
      .where(
        and(
          eq(orgMembers.userId, user_id),
          eq(orgMembers.organizationId, org_id),
        ),
      );
    if (result.rowsAffected === 0) {
      throw new NotFoundException('User not found in the Organization');
    }
    return {message: 'user removed from org succcessfully'};
  }

  async deleteOrganization(org_id: number) {
    const result = await this.db
      .delete(organizations)
      .where(eq(organizations.id, org_id));
    if (result.rowsAffected === 0) {
      throw new NotFoundException('Organization not found');
    }
    return {message: 'organization deleted successfully'};
  }

  async getTeamDetails(org_id: number, team_id: number, user_id: number) {
    return await this.teamService.getUserinTeaminOrg(team_id, user_id, org_id);
  }

  async addTeamUnderOrg(createTeamDto: CreateTeamDto, user_id: number) {
    const orgExists = await this.findOrgById(createTeamDto.org_id);
    if (!orgExists) {
      throw new ConflictException('org doesnt exists');
    }

    const teamAlreadyInOrg = await this.teamService.findATeamUnderOrgByName(
      createTeamDto.org_id,
      createTeamDto.team_name,
    );
    if (teamAlreadyInOrg) {
      throw new ConflictException('team is already added inside org');
    }
    const teamDetails = await this.teamService.createTeam(createTeamDto);

    await this.teamService.addMemberToTeam(
      teamDetails.id,
      user_id,
      orgExists.id,
      true,
    );

    return teamDetails;
  }

  async getTeamsThatUserIsPartOf(org_id: number, user_id: number) {
    return this.teamService.getAllTeamsThatUserIsPartOf(org_id, user_id);
  }

  async getTeamInsideOrg(org_id: number, team_id: number) {
    const orgExists = await this.findOrgById(org_id);
    if (!orgExists) {
      throw new ConflictException('org doesnt exists');
    }
    const teamExistsInOrg = await this.teamService.findATeamUnderOrgById(
      org_id,
      team_id,
    );
    if (!teamExistsInOrg) {
      throw new ConflictException('team doesnot exist inside org');
    }
    return teamExistsInOrg;
  }

  async grantAdminRoleToUserInTeam(
    org_id: number,
    team_id: number,
    user_id: number,
  ) {
    // check if Team and org exists
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);
    // throws forbidden exception if user is not found inside team inside Org
    await this.getTeamDetails(org_id, team_id, user_id);
    await this.teamService.makeUserAdminInsideTeam(user_id, teamExistsInOrg.id);
    return {msg: 'admin permission granted inside team'};
  }

  async addUserToATeam(org_id: number, team_id: number, user_id: number) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);

    const isUserPartofOrg = await this.getMemberInOrg(org_id, user_id);

    if (!isUserPartofOrg) {
      throw new ConflictException('user is not part of this org');
    }

    return await this.teamService.addMemberToTeam(
      teamExistsInOrg.id,
      user_id,
      org_id,
    );
  }

  async removeUserFromTeam(org_id: number, team_id: number, user_id: number) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);

    const isUserPartofOrg = await this.getMemberInOrg(org_id, user_id);

    if (!isUserPartofOrg) {
      throw new ConflictException('user is not part of this org');
    }
    return await this.teamService.removeMemberFromTeam(
      teamExistsInOrg.id,
      user_id,
      org_id,
    );
  }

  async getTeamMember(
    org_id: number,
    team_id: number,
    search_text: string,
    offset: number,
    limit: number,
  ) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);

    const users = await this.teamService.getUsersinTeamInOrg(
      teamExistsInOrg.id,
      org_id,
      search_text,
      offset,
      limit,
    );

    return {
      ...teamExistsInOrg,
      users: users,
    };
  }

  async createTask(
    org_id: number,
    team_id: number,
    createTaskDto: CreateTaskDto,
  ) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);
    const task = await this.taskService.create(
      createTaskDto,
      teamExistsInOrg.id,
      teamExistsInOrg.org_id,
    );
    await this.drawingBoardService.create(task.id);
    return task;
  }

  async updateTask(
    org_id: number,
    team_id: number,
    task_id: number,
    updateTaskDto: UpdateTaskDto,
  ) {
    await this.getTeamInsideOrg(org_id, team_id);
    return await this.taskService.updateTask(task_id, updateTaskDto);
  }

  async getTasks(org_id: number, team_id: number) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);
    return await this.taskService.getAllTasksOfATeamInsideOrg(
      org_id,
      teamExistsInOrg.id,
    );
  }

  async getTaskById(org_id: number, team_id: number, task_id: number) {
    const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_id);
    return await this.taskService.getTaskOfATeamInsideOrg(
      org_id,
      teamExistsInOrg.id,
      task_id,
    );
  }

  async assignTask(
    org_id: number,
    team_id: number,
    task_id: number,
    assignee_id: number,
  ) {
    const {user_id} = await this.teamService.getUserinTeaminOrg(
      team_id,
      assignee_id,
      org_id,
    );
    await this.taskService.assignTask(user_id, task_id);
    return {msg: 'task assigned to the user successfully'};
  }

  async revokeTask(
    org_id: number,
    team_id: number,
    task_id: number,
    revoked_from: number,
  ) {
    const {user_id} = await this.teamService.getUserinTeaminOrg(
      team_id,
      revoked_from,
      org_id,
    );
    await this.taskService.revokeTask(user_id, task_id);
    return {msg: 'task revoked from user successfully'};
  }
}
