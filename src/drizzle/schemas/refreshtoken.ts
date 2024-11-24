import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { relations } from 'drizzle-orm';

export const refreshTokens = sqliteTable('refresh_tokens', {
  refreshToken: text('refresh_token').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  expiresAt: text('expires_at').notNull(),
});

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
