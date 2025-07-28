import { teams } from './teams.schema';
import { relations } from 'drizzle-orm';
import { pgTable, json, uuid } from 'drizzle-orm/pg-core';

export const drawingBoards = pgTable('drawing_boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  team_id: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  edges: json('edges'),
  nodes: json('nodes'),
});

export const drawingBoardsRelations = relations(drawingBoards, ({ one }) => ({
  teams: one(teams, {
    fields: [drawingBoards.team_id],
    references: [teams.id],
  }),
}));

export type SelectBoards = typeof drawingBoards.$inferSelect;
export type InsertBoards = typeof drawingBoards.$inferInsert;
