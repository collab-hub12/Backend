import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { relations, sql } from 'drizzle-orm';

export const invitations = sqliteTable(
  'invitations',
  {
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    invitation_from: integer('invitation_from')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: text('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.invitation_from] }),
  }),
);

export const invitationRelations = relations(invitations, ({ one }) => ({
  user: one(users, {
    fields: [invitations.user_id],
    references: [users.id],
  }),
  org: one(organizations, {
    fields: [invitations.invitation_from],
    references: [organizations.id],
  }),
}));
