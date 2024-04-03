import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';

export const DrizzleAsyncProvider = "drizzleProvider"

export const drizzleProvider = [{
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
        const db = drizzle(client);
        return db
    },
    exports: [DrizzleAsyncProvider]
}]
