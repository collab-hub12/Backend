import {organizations} from './organizations.schema';
import {users} from './users.schema';
import {relations, sql} from 'drizzle-orm';
import {integer, pgTable, serial, text} from 'drizzle-orm/pg-core';

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
  invitation_from: integer('invitation_from')
    .notNull()
    .references(() => organizations.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expiresAt: text('expires_at').notNull(),
});

export const invitationRelations = relations(invitations, ({one}) => ({
  user: one(users, {
    fields: [invitations.user_id],
    references: [users.id],
  }),
  org: one(organizations, {
    fields: [invitations.invitation_from],
    references: [organizations.id],
  }),
}));
