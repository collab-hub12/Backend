import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {CreateUserDto} from './dto/user.dto';
import {users} from 'src/drizzle/schemas/users.schema';
import {eq, count, or, like, getTableColumns} from 'drizzle-orm';
import {schema} from 'src/drizzle/schemas/schema';
import {InvitationsService} from 'src/invitations/invitations.service';
import {OrganizationService} from 'src/organization/organization.service';
import {assignedTasks} from 'src/drizzle/schemas/tasks.schema';
import {hash} from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    private readonly invitationService: InvitationsService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly orgService: OrganizationService,
  ) { }

  async create(dto: CreateUserDto) {
    const [query] = await this.db
      .select({value: count()})
      .from(users)
      .where(eq(users.email, dto.email));
    const countUser = query.value;

    if (countUser > 0)
      throw new ConflictException('This Email is already Registered');

    const newUser = await this.db
      .insert(users)
      .values({
        ...dto,
        password: await hash(dto.password, 10),
      })
      .returning();

    return newUser[0];
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

  async findById(id: number) {
    const [result] = await this.db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getAllUser(search_text?: string, offset?: number, limit?: number) {
    search_text = search_text?.toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, ...columns} = getTableColumns(users);
    // fetch all users
    const query = this.db.select(columns).from(users).offset(offset).limit(limit);
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
    const [resultTotalUserCount] = await this.db.select({count: count(users.id)}).from(users);
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

  async getUserTasks(user_id: number, offset?: number, limit?: number) {
    return await this.db.query.assignedTasks.findMany({
      with: {
        task: true,
      },
      where: eq(assignedTasks.user_id, user_id),
      offset,
      limit,
    });
  }
}
