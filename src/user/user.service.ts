import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {CreateUserDto} from './dto/user.dto';
import {users} from 'src/drizzle/schemas/users.schema';
import {eq, count} from 'drizzle-orm';
import {hash} from 'bcrypt';
import {schema} from 'src/drizzle/schemas/schema';


@Injectable()
export class UserService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

    async create(dto: CreateUserDto) {

        const query = await this.db.select({value: count()}).from(users).where(eq(users.email, dto.email));
        const countUser = query[0].value
        if (countUser > 0) throw new ConflictException('This Email is already Registered')

        const newUser = await this.db.insert(users).values({
            ...dto,
            password: await hash(dto.password, 10),
        }).returning()

        const {password, ...result} = newUser[0]
        return result
    }

    async findByEmail(email: string) {
        const result = await this.db.select().from(users).where(eq(users.email, email));
        return result[0]
    }

    async findById(id: number) {
        const result = await this.db.select().from(users).where(eq(users.id, id));

        return result[0]
    }
}


