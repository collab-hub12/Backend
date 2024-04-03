import {sql} from 'drizzle-orm';
import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable("users", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    createdAt: text('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

export type SelectUser = typeof users.$inferSelect;