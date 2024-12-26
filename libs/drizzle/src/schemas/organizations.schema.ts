import { relations, sql } from 'drizzle-orm';
import {
  serial,
  integer,
  primaryKey,
  pgTable,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { teamMember } from './teams.schema';
import { tasks } from './tasks.schema';
import { invitations } from './invitations.schema';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  org_name: text('org_name').notNull(),
  org_desc: text('org_description').notNull(),
  founder_id: integer('founder_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  location: text('location').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// founder of org relation
export const orgRelations = relations(organizations, ({ one, many }) => ({
  founder: one(users, {
    fields: [organizations.founder_id],
    references: [users.id],
  }),
  member: many(orgMembers),
  teamMember: many(teamMember),
  task: many(tasks),
  invitations: many(invitations),
}));

// many users can be part of many organizations
export const orgMembers = pgTable(
  'organization_members',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    is_admin: boolean('is_admin').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.organizationId, t.userId] }),
  }),
);

export const orgMemberRelations = relations(orgMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [orgMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

export type SelectOrganization = typeof organizations.$inferSelect;
export type InsertOrgnization = typeof organizations.$inferInsert;
