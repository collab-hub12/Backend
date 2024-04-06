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


@Injectable()
export class OrganizationService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
        private readonly userService: UserService,
        private readonly teamService: TeamService
    ) { }

    async createOrganization(dto: CreateOrgDto) {
        const founder = await this.userService.findById(dto.founder_id)
        if (!founder) {
            throw new ConflictException('user not found')
        }
        const result = await this.db.insert(organizations).values(dto).returning()
        const org_id = result[0].id
        await this.db.insert(orgMembers).values({userId: dto.founder_id, organizationId: org_id})
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

    async addMember(org_id: number, dto: AddUserToOrgDto) {
        const member = await this.userService.findById(dto.user_id)
        if (!member) {
            throw new ConflictException('user not found')
        }
        const result = await this.findOrgById(org_id)
        if (!result) {
            throw new ConflictException('org doesnt exists')
        }
        const isAlreadyInOrg = (await this.db.select().from(orgMembers).where(
            and(
                eq(orgMembers.organizationId, org_id),
                eq(orgMembers.userId, dto.user_id)
            )
        ))[0]

        if (isAlreadyInOrg) {
            throw new ConflictException('user is already added in Org')
        }

        return await this.db.insert(orgMembers).values({userId: dto.user_id, organizationId: org_id})
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
                user: {
                    columns: {
                        password: false
                    }
                }
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

        const teamAlreadyInOrg = await this.teamService.FindATeamUnderOrg(createTeamDto.org_id, createTeamDto.team_name)
        if (teamAlreadyInOrg) {
            throw new ConflictException('team is already part of org')
        }
        const teamDetails = await this.teamService.createTeam(createTeamDto);

        // pending task : orgExists.founder_id should be changed to requested user
        await this.teamService.addMemberToTeam(teamDetails.id, orgExists.founder_id)

        return teamDetails
    }

    async getTeams(org_id: number) {
        return this.teamService.getAllTeamsUnderOrg(org_id)
    }
    async createTask(org_id: number, team_id: number, createTaskDto) {

        // pending 
    }
}
