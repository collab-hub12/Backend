import { relations, sql } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { orgMembers, organizations } from './organizations.schema';
import { assignedTasks } from './tasks.schema';
import { teamMember } from './teams.schema';
import { invitations } from './invitations.schema';
import { refreshTokens } from './refreshtoken';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  picture: text('picture').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizations),
  orgMember: many(orgMembers),
  assignedTask: many(assignedTasks),
  teamMember: many(teamMember),
  invitations: many(invitations),
  refreshToken: many(refreshTokens),
}));

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
