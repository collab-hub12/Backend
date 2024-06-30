import 'dotenv/config';
import type {Config} from 'drizzle-kit';
export default {
    schema: [
        './src/drizzle/schemas/users.schema.ts',
        './src/drizzle/schemas/organizations.schema.ts',
        './src/drizzle/schemas/tasks.schema.ts',
        './src/drizzle/schemas/teams.schema.ts',
        './src/drizzle/schemas/boards.schema.ts'
    ],
    out: './migrations',
    driver: 'turso',
    dbCredentials: {
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    },
    verbose: true,
    strict: true,

} satisfies Config;