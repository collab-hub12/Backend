import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {CreateOrgDto} from './dto/organization.dto';
import {UserService} from 'src/user/user.service';
import {organizations} from 'src/drizzle/schemas/organizations.schema';

@Injectable()
export class OrganizationService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase,
        private readonly userService: UserService
    ) { }
    async createOrganization(dto: CreateOrgDto) {
        const founder = await this.userService.findById(dto.founder_id)
        if (!founder) {
            throw new ConflictException('user not found')
        }
        return this.db.insert(organizations).values(dto).returning()
    }
}
