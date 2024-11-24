import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { orgMembers, organizations } from './organizations.schema';
import { assignedTasks } from './tasks.schema';
import { teamMember } from './teams.schema';
import { roomMembers } from './room.schema';
import { invitations } from './invitations.schema';
import { refreshTokens } from './refreshtoken';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
  roomMember: many(roomMembers),
  invitations: many(invitations),
  refreshToken: many(refreshTokens),
}));

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
