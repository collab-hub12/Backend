import {defineConfig} from "drizzle-kit";
export default defineConfig({
    schema: "./src/drizzle/schemas/*",
    dbCredentials: {
        url: process.env.POSTGRES_CONNECTION_STRING!,
    },
    out: "./src/drizzle/migrations",
});
