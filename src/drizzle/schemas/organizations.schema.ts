import {relations, sql} from 'drizzle-orm';
import {integer, primaryKey, sqliteTable, text, unique} from 'drizzle-orm/sqlite-core';
import {users} from './users.schema';

export const organizations = sqliteTable("organizations", {
    id: integer("id").primaryKey({autoIncrement: true}),
    org_name: text("org_name").notNull(),
    org_desc: text("org_description").notNull(),
    founder_id: integer("founder_id").notNull().references(() => users.id),
    location: text("location").notNull(),
    createdAt: text('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
})

// founder of org relation
export const orgRelations = relations(organizations,
    ({one, many}) => ({
        founder: one(users, {
            fields: [organizations.founder_id],
            references: [users.id]
        }),
        member: many(orgMembers)
    })
)

// many users can be part of many organizations
export const orgMembers = sqliteTable('organization_members', {
    userId: integer('user_id').notNull().references(() => users.id),
    organizationId: integer('organization_id').notNull().references(() => organizations.id),
}, (t) => ({
    pk: primaryKey({columns: [t.organizationId, t.userId]}),
}),
);

export const orgMemberRelations = relations(orgMembers, ({one}) => ({
    organization: one(organizations, {
        fields: [orgMembers.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [orgMembers.userId],
        references: [users.id],
    }),
}))



export type SelectUser = typeof organizations.$inferSelect;
export type InsertUser = typeof organizations.$inferInsert;