import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    schema: './libs/drizzle/src/schemas/*',
    dbCredentials: {
        url: process.env.POSTGRES_CONNECTION_STRING!,
    },
    out: './libs/drizzle/src/migrations',
});
