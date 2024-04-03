import {Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {SelectUser, users} from 'src/drizzle/schemas/users.schema';

@Injectable()
export class AuthService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase) { }
    async getusers(): Promise<SelectUser[]> {
        return this.db.select().from(users).all();
    }
}
