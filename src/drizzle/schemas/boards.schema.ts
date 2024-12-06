import {tasks} from './tasks.schema';
import {relations} from 'drizzle-orm';
import {integer, serial, text, pgTable, json} from 'drizzle-orm/pg-core';

export const drawingBoards = pgTable('drawing_boards', {
  id: serial('id').primaryKey(),
  task_id: integer('task_id')
    .notNull()
    .references(() => tasks.id, {onDelete: 'cascade'}),
  edges: json('edges'),
  nodes: json('nodes'),
});

export const drawingBoardsRelations = relations(drawingBoards, ({one}) => ({
  tasks: one(tasks, {
    fields: [drawingBoards.task_id],
    references: [tasks.id],
  }),
}));

export type SelectBoards = typeof drawingBoards.$inferSelect;
export type InsertBoards = typeof drawingBoards.$inferInsert;
