import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {CreateUserDto, UpdateUserDto} from './dto/user.dto';
import {users} from '@app/drizzle/schemas/users.schema';
import {eq, and, count, or, like, getTableColumns} from 'drizzle-orm';
import {schema} from '@app/drizzle/schemas/schema';
import {InvitationsService} from 'src/invitations/invitations.service';
import {OrganizationService} from 'src/organization/organization.service';
import {hash} from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    @Inject(forwardRef(() => InvitationsService))
    private readonly invitationService: InvitationsService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly orgService: OrganizationService,
  ) { }

  async create(dto: CreateUserDto) {

    const [newUser] = await this.db
      .insert(users)
      .values({
        ...dto,
        password: await hash(dto.password, 10),
      })
      .returning();

    const {password, ...response} = newUser
    return response;
  }

  async findOne(id: number) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async findByEmail(email: string) {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result;
  }

  async findByEmailVerified(email: string) {
    const [result] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isVerified, true)));

    return result;
  }

  async UpdateUser(updateuserDTO: UpdateUserDto) {
    const {email, ...updateValues} = updateuserDTO
    await this.db.update(users).set(updateValues).where(eq(users.email, email));
  }

  async findById(id: number) {
    const [result] = await this.db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getAllUser(search_text?: string, offset?: number, limit?: number) {
    search_text = search_text?.toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, ...columns} = getTableColumns(users);
    // fetch all users
    const query = this.db
      .select(columns)
      .from(users)
      .offset(offset)
      .limit(limit);
    // search by email or name
    if (search_text) {
      return query.where(
        or(
          like(users.email, `%${search_text}%`),
          like(users.name, `%${search_text}%`),
        ),
      );
    }
    //count total users
    const [resultTotalUserCount] = await this.db
      .select({count: count(users.id)})
      .from(users);
    const result = await query;

    return {
      page: Math.floor(offset / limit) + 1,
      totalElements: resultTotalUserCount.count,
      totalPages: Math.ceil(resultTotalUserCount.count / limit),
      data: result,
    };
  }

  async getInvitaions(user_id: number) {
    return await this.invitationService.getAllInvites(user_id);
  }

  async respondToInvitaion(status: string, user_id: number, org_id: number) {
    await this.invitationService.remove(org_id, user_id);

    if (status === 'accept') {
      await this.orgService.addMemberToOrg(org_id, user_id);
    }
    return {message: 'Invitation Responded'};
  }
}
