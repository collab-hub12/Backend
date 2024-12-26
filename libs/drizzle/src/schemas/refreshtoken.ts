import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { relations } from 'drizzle-orm';

export const refreshTokens = pgTable('refresh_tokens', {
  refreshToken: text('refresh_token').primaryKey(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  expiresAt: text('expires_at').notNull(),
});

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
