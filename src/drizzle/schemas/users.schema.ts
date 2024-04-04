import {relations, sql} from 'drizzle-orm';
import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {orgMembers, organizations} from './organizations.schema';

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({autoIncrement: true}),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: text('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

export const usersRelations = relations(users, ({many}) => ({
    organizations: many(organizations),
    orgMember: many(orgMembers)
}))

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;