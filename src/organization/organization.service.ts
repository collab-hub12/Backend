import {ConflictException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {AddUserToOrgDto, CreateOrgDto} from './dto/organization.dto';
import {UserService} from 'src/user/user.service';
import {orgMembers, organizations} from 'src/drizzle/schemas/organizations.schema';
import {and, eq, like} from 'drizzle-orm';
import type {schema} from 'src/drizzle/schemas/schema';
import {TeamService} from 'src/team/team.service';
import {CreateTeamDto} from 'src/team/dto/team.dto';
import {CreateTaskDto} from 'src/task/dto/create-task.dto';
import {TaskService} from 'src/task/task.service';


@Injectable()
export class OrganizationService {

    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
        private readonly userService: UserService,
        private readonly teamService: TeamService,
        private readonly taskService: TaskService
    ) { }

    async createOrganization(dto: CreateOrgDto, founder_id: number) {
        const founder = await this.userService.findById(founder_id)
        if (!founder) {
            throw new ConflictException('user not found')
        }
        const result = await this.db.insert(organizations).values({...dto, founder_id}).returning()
        const org_id = result[0].id
        await this.db.insert(orgMembers).values({userId: founder_id, organizationId: org_id, is_admin: true})
        return result[0]
    }

    async findOrgById(org_id: number) {
        const org_detail = (await this.db.select().from(organizations).where(
            eq(organizations.id, org_id)
        ))[0]

        if (!org_detail) throw new NotFoundException("org not found")
        return org_detail
    }

    async findOrgs(search_text: string, offset: number, limit: number) {
        const org_details = await this.db.select().from(organizations).where(like(
            organizations.org_name,
            `%${search_text}%`)
        )
            .limit(limit)
            .offset(offset)
        return org_details
    }

    async getMemberInOrg(org_id: number, user_id: number) {

        const result = (await this.db.select().from(orgMembers).where(
            and(
                eq(orgMembers.organizationId, org_id),
                eq(orgMembers.userId, user_id)
            )
        ))[0]


        if (!result) {
            throw new ConflictException("member not found inside org")
        }
        return result
    }

    async makeUserAdminInsideOrg(user_id: number, org_id: number) {
        const rowsAffected = (await this.db.update(orgMembers).set({is_admin: true}).where(
            and(
                eq(orgMembers.userId, user_id),
                eq(orgMembers.organizationId, org_id),
            )
        )).rowsAffected;
        if (!rowsAffected) throw new ConflictException("issue occured while making an user admin");
    }

    async addMember(org_id: number, dto: AddUserToOrgDto) {
        await this.userService.findById(dto.user_id)
        const result = await this.findOrgById(org_id)
        if (!result) {
            throw new ConflictException('org doesnt exists')
        }
        const isAlreadyInOrg = await this.getMemberInOrg(org_id, dto.user_id)

        if (isAlreadyInOrg) {
            throw new ConflictException('user is already added in Org')
        }

        return await this.db.insert(orgMembers).values({userId: dto.user_id, organizationId: org_id, is_admin: false})
    }

    async getMembers(org_id: number) {
        const orgExists = await this.findOrgById(org_id)
        if (!orgExists) {
            throw new ConflictException('org doesnt exists')
        }
        return await this.db.query.orgMembers.findMany({
            where: (orgMember, {eq}) => eq(orgMember.organizationId, org_id),
            columns: {
                userId: false,
                organizationId: false
            },
            with: {
                user: true
            }
        })
    }

    async CheckFounderorNot(org_id: number, user_id: number): Promise<boolean> {
        const IsFounder = (await this.db.select().from(organizations).where(
            and(
                eq(organizations.founder_id, user_id),
                eq(organizations.id, org_id)
            )
        ))[0]
        return Boolean(IsFounder);
    }

    async removeMember(org_id: number, user_id: number) {
        const orgExists = await this.findOrgById(org_id)
        if (!orgExists) {
            throw new ConflictException('org doesnt exists')
        }

        const IsFounder = await this.CheckFounderorNot(org_id, user_id)

        if (IsFounder) {
            throw new ConflictException("Founder cannot be removed")
        }

        const result = await this.db.delete(orgMembers).where(
            and(
                eq(orgMembers.userId, user_id),
                eq(orgMembers.organizationId, org_id)
            ))
        if (result.rowsAffected === 0) {
            throw new NotFoundException("User not found in the Organization")
        }
        return {"message": "user removed from org succcessfully"}
    }

    async deleteOrganization(org_id: number) {
        const result = await this.db.delete(organizations).where(eq(organizations.id, org_id))
        if (result.rowsAffected === 0) {
            throw new NotFoundException("Organization not found")
        }
        return {"message": "organization deleted successfully"}
    }

    async addTeamUnderOrg(createTeamDto: CreateTeamDto) {
        const orgExists = await this.findOrgById(createTeamDto.org_id)
        if (!orgExists) {
            throw new ConflictException('org doesnt exists')
        }

        const teamAlreadyInOrg = await this.teamService.findATeamUnderOrg(createTeamDto.org_id, createTeamDto.team_name)
        if (teamAlreadyInOrg) {
            throw new ConflictException('team is already part of org')
        }
        const teamDetails = await this.teamService.createTeam(createTeamDto);

        // pending task : orgExists.founder_id should be changed to requested user
        await this.teamService.addMemberToTeam(teamDetails.id, orgExists.founder_id, orgExists.id)

        return teamDetails
    }

    async getTeams(org_id: number) {
        return this.teamService.getAllTeamsUnderOrg(org_id)
    }

    async getTeamInsideOrg(org_id: number, team_name: string) {
        const orgExists = await this.findOrgById(org_id)
        if (!orgExists) {
            throw new ConflictException('org doesnt exists')
        }
        const teamExistsInOrg = await this.teamService.findATeamUnderOrg(org_id, team_name)
        if (!teamExistsInOrg) {
            throw new ConflictException('team doesnot exist inside org')
        }
        return teamExistsInOrg
    }

    async addUserToATeam(org_id: number, team_name: string, user_id: number) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)

        const isUserPartofOrg = await this.getMemberInOrg(org_id, user_id)

        if (!isUserPartofOrg) {
            throw new ConflictException('user is not part of this org');
        }

        return await this.teamService.addMemberToTeam(teamExistsInOrg.id, user_id, org_id)
    }

    async removeUserFromTeam(org_id: number, team_name: string, user_id: number) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)

        const isUserPartofOrg = await this.getMemberInOrg(org_id, user_id)

        if (!isUserPartofOrg) {
            throw new ConflictException('user is not part of this org');
        }
        return await this.teamService.removeMemberFromTeam(teamExistsInOrg.id, user_id, org_id)
    }

    async getTeamMember(org_id: number, team_name: string) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)
        return await this.teamService.getUsersinTeamInOrg(teamExistsInOrg.id, org_id)
    }

    async createTask(org_id: number, team_name: string, createTaskDto: CreateTaskDto) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)
        return await this.taskService.create(createTaskDto, teamExistsInOrg.id, teamExistsInOrg.org_id)
    }

    async getTasks(org_id: number, team_name: string) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)
        return await this.taskService.getAllTasksOfATeamInsideOrg(org_id, teamExistsInOrg.id)
    }

    async assignTask(org_id: number, team_name: string, task_id: number, assignee_id: number) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)
        const {user_id} = await this.teamService.getUserinTeaminOrg(teamExistsInOrg.id, assignee_id, org_id)
        await this.taskService.assignTask(user_id, task_id)
        return {"msg": "task assigned to the user successfully"}
    }

    async revokeTask(org_id: number, team_name: string, task_id: number, revoked_from: number) {
        const teamExistsInOrg = await this.getTeamInsideOrg(org_id, team_name)
        const {user_id} = await this.teamService.getUserinTeaminOrg(teamExistsInOrg.id, revoked_from, org_id)
        await this.taskService.revokeTask(user_id, task_id)
        return {"msg": "task revoked from user successfully"}
    }

}
