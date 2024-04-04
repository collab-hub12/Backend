import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';
import * as user_schema from './schemas/users.schema'
import * as org_schema from './schemas/organizations.schema'

export const DrizzleAsyncProvider = "drizzleProvider"

export const drizzleProvider = [{
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
        const db = drizzle(client, {schema: {...org_schema, ...user_schema}});
        return db
    },
    exports: [DrizzleAsyncProvider]
}]
