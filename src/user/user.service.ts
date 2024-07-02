import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { CreateUserDto } from './dto/user.dto';
import { users } from 'src/drizzle/schemas/users.schema';
import { eq, count, or, like } from 'drizzle-orm';
import { schema } from 'src/drizzle/schemas/schema';

@Injectable()
export class UserService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
  ) {}

  async create(dto: CreateUserDto) {
    const query = await this.db
      .select({ value: count() })
      .from(users)
      .where(eq(users.email, dto.email));
    const countUser = query[0].value;
    if (countUser > 0)
      throw new ConflictException('This Email is already Registered');

    const newUser = await this.db.insert(users).values(dto).returning();

    return newUser[0];
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0];
  }

  async findById(id: number) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getAllUser(search_text?: string, offset?: number, limit?: number) {
    search_text = search_text?.toLowerCase();
    return await this.db
      .select()
      .from(users)
      .where(
        or(
          like(users.email, `%${search_text}%`),
          like(users.name, `%${search_text}%`),
        ),
      )
      .offset(offset)
      .limit(limit);
  }
}
