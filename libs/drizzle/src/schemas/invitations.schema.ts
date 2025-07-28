import { organizations } from './organizations.schema';
import { relations, sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  sent_to: text('sent_to').notNull(),
  invitation_from: uuid('invitation_from')
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

export const invitationRelations = relations(invitations, ({ one }) => ({
  org: one(organizations, {
    fields: [invitations.invitation_from],
    references: [organizations.id],
  }),
}));
